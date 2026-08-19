"""yt-dlp wrappers for metadata extraction and direct download URLs."""

from __future__ import annotations

import glob
import hashlib
import json
import os
import secrets
import shutil
import subprocess
import sys
import tempfile


backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from utils.platform import detect_platform


YTDLP_PATH = os.environ.get("YTDLP_PATH", "yt-dlp")
USE_MOCK = os.environ.get("USE_MOCK_WHEN_YTDLP_MISSING", "false").lower() == "true"

DEFAULT_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

PLATFORM_REFERERS = {
    "tiktok": "https://www.tiktok.com/",
    "instagram": "https://www.instagram.com/",
    "facebook": "https://www.facebook.com/",
    "twitter": "https://x.com/",
    "threads": "https://www.threads.net/",
}

# CDN blocks phone + simple proxy; yt-dlp must download on the PC first.
FORCE_SERVER_DOWNLOAD = frozenset(
    {"tiktok", "instagram", "facebook", "twitter", "threads", "snapchat"}
)


def _format_bytes(n: int | float | None) -> str | None:
    if not n:
        return None
    size = float(n)
    units = ["B", "KB", "MB", "GB"]
    i = 0
    while size >= 1024 and i < len(units) - 1:
        size /= 1024
        i += 1
    return f"{size:.1f} {units[i]}"


def _run_ytdlp(args: list[str]) -> str:
    try:
        import yt_dlp
    except ImportError:
        pass

    if YTDLP_PATH == "yt-dlp":
        cmd = [sys.executable, "-m", "yt_dlp", *args]
    else:
        cmd = [YTDLP_PATH, *args]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
        )
    except FileNotFoundError as e:
        raise RuntimeError(
            "yt-dlp is not installed. Install with: pip install -U yt-dlp"
        ) from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError("yt-dlp timed out — try again or use a shorter video") from e

    if result.returncode != 0:
        err = (result.stderr or result.stdout or "").strip()
        raise RuntimeError(err or f"yt-dlp failed (code {result.returncode})")
    return result.stdout


def ytdlp_available() -> bool:
    try:
        import yt_dlp
        return True
    except ImportError:
        pass
    try:
        _run_ytdlp(["--version"])
        return True
    except Exception:
        return False



def _resolve_cookies_file() -> str | None:
    raw_cookies = os.environ.get("YTDLP_COOKIES", "").strip()
    if raw_cookies:
        target_path = "/tmp/cookies.txt" if os.path.exists("/tmp") else os.path.join(backend_dir, "cookies.txt")
        try:
            with open(target_path, "w", encoding="utf-8") as f:
                f.write(raw_cookies)
            return target_path
        except Exception as e:
            print(f"[yt-dlp warning] Failed writing YTDLP_COOKIES: {e}")

    local_cookies = os.path.join(backend_dir, "cookies.txt")
    if os.path.isfile(local_cookies):
        return local_cookies

    env_file = os.environ.get("YTDLP_COOKIES_FILE", "").strip()
    if env_file and os.path.isfile(env_file):
        return env_file

    return None


def _ytdlp_common_args() -> list[str]:
    args = [
        "--no-playlist",
        "--no-warnings",
        "--extractor-args",
        "youtube:player_client=android_vr,tv_embedded,android,ios",
    ]
    cookies_path = _resolve_cookies_file()
    if cookies_path:
        args.extend(["--cookies", cookies_path])
    else:
        browser = os.environ.get("YTDLP_COOKIES_BROWSER", "").strip()
        if browser:
            args.extend(["--cookies-from-browser", browser])
    return args


def _get_ytdlp_options(extra_opts: dict | None = None) -> dict:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "extractor_args": {
            "youtube": {
                "player_client": ["android_vr", "tv_embedded", "android", "ios"]
            }
        },
        "http_headers": {
            "User-Agent": DEFAULT_UA,
            "Accept-Language": "en-US,en;q=0.9",
        },
    }
    cookies_path = _resolve_cookies_file()
    if cookies_path:
        opts["cookiefile"] = cookies_path

    if extra_opts:
        opts.update(extra_opts)
    return opts





def _format_selector(quality_id: str, media_type: str, platform: str = "") -> str:
    if platform == "tiktok":
        return "bestaudio/best" if media_type == "audio" else "b/best"
    if media_type == "audio":
        return "bestaudio/b/best"
    if quality_id and quality_id not in ("auto", "best"):
        clean_q = quality_id.replace("p", "").strip()
        return f"b[format_id={quality_id}]/b[height<={clean_q}]/b/best"
    return "b/best"




def _select_format(info: dict, quality_id: str, media_type: str) -> dict | None:
    formats = [f for f in (info.get("formats") or []) if f.get("url")]
    if not formats:
        return None

    if media_type == "audio":
        audio = [
            f
            for f in formats
            if f.get("acodec") not in (None, "none") and f.get("vcodec") in (None, "none")
        ]
        return audio[-1] if audio else formats[-1]

    if quality_id and quality_id not in ("auto", "best"):
        for f in formats:
            if str(f.get("format_id")) == quality_id:
                return f

    video = [f for f in formats if f.get("vcodec") not in (None, "none")]
    video.sort(key=lambda x: x.get("height") or 0, reverse=True)
    for f in video:
        if f.get("ext") == "mp4":
            return f
    return video[0] if video else formats[-1]


def _needs_server_download(fmt: dict) -> bool:
    url = str(fmt.get("url") or "")
    protocol = str(fmt.get("protocol") or "")
    ext = str(fmt.get("ext") or "")
    return "m3u8" in protocol or "m3u8" in url or ext == "m3u8"


def _build_request_headers(url: str, fmt: dict) -> dict[str, str]:
    headers = {str(k): str(v) for k, v in (fmt.get("http_headers") or {}).items()}
    platform = detect_platform(url)
    referer = PLATFORM_REFERERS.get(platform)
    if referer:
        headers.setdefault("Referer", referer)
    headers.setdefault("User-Agent", DEFAULT_UA)
    return headers


def _map_formats(formats: list[dict[str, Any]]) -> tuple[list[dict], list[dict]]:
    video: list[dict] = []
    audio: list[dict] = []

    for f in formats or []:
        if not f or f.get("url") is None:
            continue
        fmt_id = str(f.get("format_id") or f.get("format_note") or "unknown")
        ext = f.get("ext") or "mp4"
        base = {
            "id": fmt_id,
            "ext": ext,
            "filesize": f.get("filesize") or f.get("filesize_approx"),
            "filesizeApprox": _format_bytes(f.get("filesize_approx"))
            if not f.get("filesize")
            else None,
        }

        vcodec = f.get("vcodec")
        acodec = f.get("acodec")

        if vcodec and vcodec != "none":
            height = f.get("height")
            video.append(
                {
                    **base,
                    "label": f.get("format_note")
                    or f.get("resolution")
                    or (f"{height}p" if height else "Video"),
                    "format": "webm" if ext == "webm" else "mp4",
                    "resolution": f.get("resolution")
                    or (f"{height}p" if height else None),
                    "fps": f.get("fps"),
                    "vcodec": vcodec,
                    "acodec": acodec,
                    "type": "video",
                }
            )
        elif acodec and acodec != "none":
            audio.append(
                {
                    **base,
                    "label": f.get("format_note") or "Audio",
                    "format": "m4a" if ext == "m4a" else "mp3",
                    "acodec": acodec,
                    "type": "audio",
                }
            )

    video.sort(key=lambda x: _height_from_label(x.get("label", "")), reverse=True)
    return video[:12], audio[:8]


def _height_from_label(label: str) -> int:
    import re

    m = re.search(r"(\d+)p", label or "")
    return int(m.group(1)) if m else 0


def _mock_metadata(url: str) -> dict:
    vid = hashlib.md5(url.encode()).hexdigest()[:12]
    return {
        "id": vid,
        "url": url,
        "platform": detect_platform(url),
        "title": "DreamerDrop Preview",
        "thumbnail": "https://picsum.photos/seed/dreamerdrop/640/360",
        "duration": 120,
        "author": "DreamerDrop",
        "description": "Install yt-dlp on the server for real extraction.",
        "qualities": [
            {
                "id": "720",
                "label": "720p",
                "format": "mp4",
                "ext": "mp4",
                "type": "video",
                "filesizeApprox": "20 MB",
            }
        ],
        "audioFormats": [
            {
                "id": "audio",
                "label": "Audio",
                "format": "mp3",
                "ext": "mp3",
                "type": "audio",
                "filesizeApprox": "4 MB",
            }
        ],
    }


def extract_metadata(url: str) -> dict:
    if not ytdlp_available():
        if USE_MOCK:
            return _mock_metadata(url)
        raise RuntimeError("yt-dlp is not installed on the server. Install with: pip install -U yt-dlp")

    info = None
    try:
        import yt_dlp
        ydl_opts = _get_ytdlp_options({"skip_download": True})
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as e:
        print(f"[yt-dlp warning] Native YoutubeDL extraction failed ({e}), trying subprocess CLI fallback.")

    if not info:
        stdout = _run_ytdlp(["-J", *_ytdlp_common_args(), url])
        info = json.loads(stdout)

    qualities, audio_formats = _map_formats(info.get("formats") or [])

    if not qualities and not audio_formats:
        qualities, audio_formats = _mock_metadata(url)["qualities"], _mock_metadata(url)[
            "audioFormats"
        ]

    vid = info.get("id") or hashlib.md5(url.encode()).hexdigest()[:12]
    thumbs = info.get("thumbnails") or []
    thumb = info.get("thumbnail") or (thumbs[-1].get("url") if thumbs else "")

    return {
        "id": str(vid),
        "url": url,
        "platform": detect_platform(url),
        "title": info.get("title") or "Untitled",
        "thumbnail": thumb or "",
        "duration": int(info.get("duration") or 0),
        "author": info.get("uploader") or info.get("channel") or "Unknown",
        "description": info.get("description"),
        "qualities": qualities,
        "audioFormats": audio_formats,
    }


def download_to_temp_file(url: str, quality_id: str, media_type: str) -> tuple[str, str]:
    """Download with yt-dlp on the PC (required for TikTok / IG / etc.)."""
    platform = detect_platform(url)
    tmp_dir = tempfile.mkdtemp(prefix="dreamerdrop_")
    out_template = os.path.join(tmp_dir, "media.%(ext)s")
    selector = _format_selector(quality_id, media_type, platform)

    try:
        import yt_dlp
        ydl_opts = _get_ytdlp_options({
            "outtmpl": out_template,
            "format": selector,
            "merge_output_format": "mp4",
        })
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except Exception as e:
        print(f"[yt-dlp warning] Native YoutubeDL download failed ({e}), trying subprocess CLI fallback.")
        args = [
            "-f",
            selector,
            *_ytdlp_common_args(),
            "--merge-output-format",
            "mp4",
            "-o",
            out_template,
            url,
        ]
        _run_ytdlp(args)

    files = sorted(
        (p for p in glob.glob(os.path.join(tmp_dir, "*")) if os.path.isfile(p)),
        key=os.path.getmtime,
    )
    if not files:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError("yt-dlp did not produce a file — try: pip install -U yt-dlp")
    return files[-1], tmp_dir


def resolve_download_info(
    url: str,
    quality_id: str,
    media_type: str,
    fmt: str,
) -> dict[str, Any]:
    if not ytdlp_available():
        if USE_MOCK:
            sample = (
                "https://commondatastorage.googleapis.com/gtv-videos-bucket/"
                "sample/BigBuckBunny.mp4"
            )
            return {"url": sample, "headers": {}, "ext": "mp4", "server_file": None, "tmpdir": None}
        raise RuntimeError("yt-dlp is not installed on the server. Install with: pip install -U yt-dlp")

    platform = detect_platform(url)

    if platform in FORCE_SERVER_DOWNLOAD:
        local_path, tmp_dir = download_to_temp_file(url, quality_id, media_type)
        ext = os.path.splitext(local_path)[1].lstrip(".") or ("mp3" if media_type == "audio" else "mp4")
        return {
            "url": None,
            "headers": {},
            "ext": ext,
            "server_file": local_path,
            "tmpdir": tmp_dir,
        }

    info = None
    try:
        import yt_dlp
        ydl_opts = _get_ytdlp_options({"skip_download": True})
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as e:
        print(f"[yt-dlp warning] Native YoutubeDL extraction failed ({e}), trying subprocess CLI fallback.")

    if not info:
        stdout = _run_ytdlp(["-J", *_ytdlp_common_args(), url])
        info = json.loads(stdout)

    fmt_entry = _select_format(info, quality_id, media_type)
    if not fmt_entry or not fmt_entry.get("url"):
        raise RuntimeError("Could not resolve a download URL for this link")

    headers = _build_request_headers(url, fmt_entry)
    ext = str(fmt_entry.get("ext") or fmt or "mp4")

    if _needs_server_download(fmt_entry):
        local_path, tmp_dir = download_to_temp_file(url, quality_id, media_type)
        return {
            "url": None,
            "headers": headers,
            "ext": ext,
            "server_file": local_path,
            "tmpdir": tmp_dir,
        }

    return {
        "url": str(fmt_entry["url"]),
        "headers": headers,
        "ext": ext,
        "server_file": None,
        "tmpdir": None,
    }




def resolve_download_url(
    url: str,
    quality_id: str,
    media_type: str,
    fmt: str,
) -> str:
    info = resolve_download_info(url, quality_id, media_type, fmt)
    if info.get("server_file"):
        raise RuntimeError("This link must be streamed through the app proxy")
    direct = info.get("url")
    if not direct:
        raise RuntimeError("Could not resolve a download URL for this link")
    return direct


def create_stream_token(entry: dict, ttl_seconds: int) -> str:
    token = secrets.token_urlsafe(16)
    from services.cache import set_cache

    set_cache(f"stream:{token}", entry, ttl_seconds)
    return token


def pick_best_quality(metadata: dict, prefer_audio: bool = False) -> dict | None:
    if prefer_audio:
        audio = metadata.get("audioFormats") or []
        if audio:
            return audio[0]
    qualities = metadata.get("qualities") or []
    if qualities:
        return qualities[0]
    audio = metadata.get("audioFormats") or []
    return audio[0] if audio else None
