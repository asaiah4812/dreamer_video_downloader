"""
DreamerDrop Flask API & Web App — social media downloads via yt-dlp, Paystack subscription, & Admin Dashboard.
"""

from __future__ import annotations

import mimetypes
import os
import shutil
import sys

# Ensure backend directory is in sys.path for Vercel serverless environment
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import requests
from dotenv import load_dotenv
from flask import (
    Flask,
    Response,
    after_this_request,
    jsonify,
    render_template,
    request,
    send_file,
    stream_with_context,
)
from flask_cors import CORS

from services.cache import get_cache, set_cache

from services.database import (
    get_admin_stats,
    get_all_subscribers,
    get_download_activity,
    get_recent_transactions,
    get_subscription_details,
    get_trial_count,
    increment_trial_count,
    init_db,
    is_subscribed,
    log_download,
    record_payment,
)

from services.ytdlp_service import (
    create_stream_token,
    extract_metadata,
    resolve_download_info,
    ytdlp_available,
)
from utils.platform import detect_platform, is_valid_url

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path, override=True)


app = Flask(__name__, template_folder="templates")
CORS(app)

# Initialize database (PostgreSQL or SQLite)
try:
    init_db()
except Exception as e:
    print(f"[Database Error] init_db failed on startup: {e}")


CACHE_TTL = int(os.environ.get("CACHE_TTL_SECONDS", "3600"))
STREAM_TTL = int(os.environ.get("STREAM_TTL_SECONDS", "900"))
PORT = int(os.environ.get("PORT", "4000"))
PAYSTACK_PUBLIC_KEY = os.environ.get("PAYSTACK_PUBLIC_KEY", "").strip()
PAYSTACK_SECRET_KEY = os.environ.get("PAYSTACK_SECRET_KEY", "").strip()
ADMIN_KEY = os.environ.get("ADMIN_KEY", "nazaya21")
FREE_TRIAL_LIMIT = 3


def get_client_ip() -> str:
    if request.headers.get("X-Forwarded-For"):
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    return request.remote_addr or "127.0.0.1"


def verify_admin_auth() -> bool:
    header_key = request.headers.get("X-Admin-Key", "").strip()
    param_key = request.args.get("adminKey", "").strip()
    return (header_key == ADMIN_KEY) or (param_key == ADMIN_KEY)


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/admin")
def admin_page():
    return render_template("admin.html")


@app.post("/api/v1/admin/auth")
def admin_auth():
    body = request.get_json(silent=True) or {}
    key = str(body.get("key", "")).strip()
    if key == ADMIN_KEY:
        return jsonify({"status": "ok", "authenticated": True})
    return jsonify({"error": "Unauthorized", "message": "Invalid admin key"}), 401


@app.get("/api/v1/admin/stats")
def admin_stats():
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401
    stats = get_admin_stats()
    return jsonify(stats)


@app.get("/api/v1/admin/transactions")
def admin_transactions():
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401
    transactions = get_recent_transactions(50)
    return jsonify(transactions)


@app.get("/api/v1/admin/subscribers")
def admin_subscribers():
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401
    subscribers = get_all_subscribers()
    return jsonify(subscribers)


@app.post("/api/v1/admin/subscriptions/add")
def admin_add_subscription():
    if not verify_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401

    body = request.get_json(silent=True) or {}
    email = str(body.get("email", "")).strip().lower()
    days = int(body.get("days", 30))

    if not email or "@" not in email:
        return jsonify({"error": "Validation failed", "message": "Valid user email address required"}), 400

    reference = f"MANUAL_{os.urandom(4).hex().upper()}"
    record = record_payment(
        email=email,
        reference=reference,
        amount=60000,
        status="success",
        days=days,
        source="manual",
    )

    return jsonify({"status": "ok", "message": f"Successfully activated paid account for {email}", "data": record})



@app.get("/api/v1/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "dreamerdrop-flask",
            "ytdlp": ytdlp_available(),
        }
    )


@app.get("/api/v1/paystack/config")
def paystack_config():
    # Dynamically read from env to support live .env edits without server restart
    load_dotenv(dotenv_path=env_path, override=True)
    pub_key = os.environ.get("PAYSTACK_PUBLIC_KEY", "").strip().strip("'\"") or PAYSTACK_PUBLIC_KEY
    return jsonify({"publicKey": pub_key, "amount": 60000, "currency": "NGN"})


@app.post("/api/v1/paystack/verify")
def paystack_verify():
    body = request.get_json(silent=True) or {}
    reference = str(body.get("reference", "")).strip()
    email = str(body.get("email", "")).strip()

    if not reference:
        return jsonify({"error": "Validation failed", "message": "Reference required"}), 400

    try:
        load_dotenv(dotenv_path=env_path, override=True)
        sec_key = os.environ.get("PAYSTACK_SECRET_KEY", "").strip().strip("'\"") or PAYSTACK_SECRET_KEY

        headers = {"Authorization": f"Bearer {sec_key}"}
        url = f"https://api.paystack.co/transaction/verify/{reference}"
        resp = requests.get(url, headers=headers, timeout=15)

        if resp.status_code != 200:
            return jsonify(
                {"error": "Verification failed", "message": f"Paystack returned HTTP {resp.status_code}"}
            ), 400

        res_data = resp.json()
        data = res_data.get("data") or {}

        if res_data.get("status") is True and data.get("status") == "success":
            user_email = email or data.get("customer", {}).get("email") or "user@dreamerdrop.com"
            amount = data.get("amount", 60000)

            record = record_payment(
                email=user_email,
                reference=reference,
                amount=amount,
                status="success",
                days=30,
            )

            return jsonify({"status": "ok", "message": "Payment verified", "data": record})
        else:
            return jsonify(
                {"error": "Payment incomplete", "message": data.get("gateway_response", "Payment failed")}
            ), 400

    except Exception as e:
        return jsonify({"error": "Paystack verification error", "message": str(e)}), 500


@app.get("/api/v1/subscription/check")
def check_subscription():
    email = request.args.get("email", "").strip()
    subscribed = is_subscribed(email) if email else False
    details = get_subscription_details(email) if subscribed else None
    return jsonify({"email": email, "subscribed": subscribed, "subscription": details})


@app.post("/api/v1/trial/status")
def trial_status():
    client_ip = get_client_ip()
    used = get_trial_count(client_ip)
    left = max(0, FREE_TRIAL_LIMIT - used)
    return jsonify({"clientIp": client_ip, "used": used, "trialsLeft": left, "limit": FREE_TRIAL_LIMIT})


@app.post("/api/v1/metadata")
def metadata():
    body = request.get_json(silent=True) or {}
    url = str(body.get("url", "")).strip()
    if not is_valid_url(url):
        return jsonify({"error": "Validation failed", "message": "Invalid URL"}), 400

    cache_key = f"meta:{url}"
    cached = get_cache(cache_key, CACHE_TTL)
    if cached:
        return jsonify({"data": cached})

    try:
        data = extract_metadata(url)
        set_cache(cache_key, data, CACHE_TTL)
        return jsonify({"data": data})
    except Exception as e:
        return jsonify({"error": "Extraction failed", "message": str(e)}), 500


@app.post("/api/v1/download")
def download():
    body = request.get_json(silent=True) or {}
    url = str(body.get("url", "")).strip()
    email = str(body.get("email", "")).strip()
    quality_id = str(body.get("qualityId", "auto")).strip()
    client_type = str(body.get("clientType", "web")).strip().lower()
    media_type = str(body.get("type", "video")).strip()
    fmt = str(body.get("format", "mp4")).strip()

    if not is_valid_url(url):
        return jsonify({"error": "Validation failed", "message": "Invalid URL"}), 400

    user_subscribed = is_subscribed(email) if email else False

    client_ip = get_client_ip()
    used_trials = get_trial_count(client_ip)

    if not user_subscribed:
        if used_trials >= FREE_TRIAL_LIMIT:
            return (
                jsonify(
                    {
                        "error": "Trial limit reached",
                        "message": f"Free trial limit reached ({FREE_TRIAL_LIMIT}/{FREE_TRIAL_LIMIT}). Subscribe for ₦600/month to download unlimited videos!",
                        "trialsLeft": 0,
                        "requiresPayment": True,
                    }
                ),
                402,
            )
        new_trial_count = increment_trial_count(client_ip)
        trials_left = max(0, FREE_TRIAL_LIMIT - new_trial_count)
    else:
        trials_left = FREE_TRIAL_LIMIT

    try:
        platform_name = detect_platform(url)
        log_download(url=url, platform=platform_name, quality_id=quality_id, client_type=client_type)

        print(f"[download] preparing: {url[:80]}… (client: {client_type})")
        info = resolve_download_info(url, quality_id, media_type, fmt)
        if info.get("server_file"):
            print(f"[download] ready: {info['server_file']}")
        stream_entry: dict = {}

        if info.get("server_file"):
            stream_entry = {
                "local_path": info["server_file"],
                "tmpdir": info.get("tmpdir"),
                "filename": os.path.basename(info["server_file"]),
            }
        else:
            stream_entry = {
                "url": info["url"],
                "headers": info.get("headers") or {},
                "filename": f"video_{os.urandom(4).hex()}.mp4",
            }

        token = create_stream_token(stream_entry, STREAM_TTL)

        return jsonify(
            {
                "data": {
                    "jobId": f"flask_{os.urandom(4).hex()}",
                    "streamUrl": f"/api/v1/stream/{token}",
                    "proxied": True,
                    "serverPrepared": bool(info.get("server_file")),
                },
                "trialsLeft": trials_left,
                "subscribed": user_subscribed,
            }
        )
    except Exception as e:
        return jsonify({"error": "Download resolve failed", "message": str(e)}), 500


@app.get("/api/v1/stream/<token>")
def stream_media(token: str):
    """Stream media file directly to user device with attachment header for automatic save."""
    entry = get_cache(f"stream:{token}", STREAM_TTL)
    if not entry:
        return jsonify(
            {"error": "Link expired", "message": "Tap download again to refresh the link"}
        ), 410

    filename = entry.get("filename") or f"dreamerdrop_{os.urandom(4).hex()}.mp4"

    local_path = entry.get("local_path")
    if local_path and os.path.isfile(local_path):
        tmpdir = entry.get("tmpdir")

        @after_this_request
        def _cleanup(response):
            try:
                if tmpdir and os.path.isdir(tmpdir):
                    shutil.rmtree(tmpdir, ignore_errors=True)
                elif os.path.isfile(local_path):
                    os.remove(local_path)
            except OSError:
                pass
            return response

        mime, _ = mimetypes.guess_type(local_path)
        return send_file(
            local_path,
            mimetype=mime or "video/mp4",
            as_attachment=True,
            download_name=os.path.basename(local_path),
        )

    target_url = entry.get("url")
    if not target_url:
        return jsonify({"error": "Invalid stream", "message": "No media URL in cache"}), 404

    headers = entry.get("headers") or {}
    try:
        upstream = requests.get(
            target_url,
            headers=headers,
            stream=True,
            timeout=120,
        )
    except requests.RequestException as e:
        return jsonify({"error": "Proxy failed", "message": str(e)}), 502

    if upstream.status_code >= 400:
        upstream.close()
        return jsonify(
            {
                "error": "Upstream denied",
                "message": f"CDN returned HTTP {upstream.status_code}. Update yt-dlp: pip install -U yt-dlp",
            }
        ), 502

    content_type = upstream.headers.get("Content-Type", "video/mp4")

    def generate():
        try:
            for chunk in upstream.iter_content(chunk_size=256 * 1024):
                if chunk:
                    yield chunk
        finally:
            upstream.close()

    response = Response(
        stream_with_context(generate()),
        status=200,
        mimetype=content_type,
    )
    content_length = upstream.headers.get("Content-Length")
    if content_length:
        response.headers["Content-Length"] = content_length

    response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
    return response


@app.errorhandler(Exception)
def handle_error(err):
    return jsonify({"error": "Server error", "message": str(err)}), 500


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    print(f"DreamerDrop API http://0.0.0.0:{PORT}/api/v1/health")
    print(f"yt-dlp available: {ytdlp_available()}")
    app.run(host="0.0.0.0", port=PORT, debug=debug)


