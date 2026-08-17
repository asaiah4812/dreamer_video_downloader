import re

PLATFORMS = [
    ("youtube", re.compile(r"(?:youtube\.com|youtu\.be)", re.I)),
    ("tiktok", re.compile(r"tiktok\.com", re.I)),
    ("instagram", re.compile(r"instagram\.com", re.I)),
    ("facebook", re.compile(r"facebook\.com|fb\.watch", re.I)),
    ("twitter", re.compile(r"(?:twitter|x)\.com", re.I)),
    ("threads", re.compile(r"threads\.net", re.I)),
    ("snapchat", re.compile(r"snapchat\.com", re.I)),
    ("vimeo", re.compile(r"vimeo\.com", re.I)),
    ("dailymotion", re.compile(r"dailymotion\.com", re.I)),
]


def detect_platform(url: str) -> str:
    for platform_id, pattern in PLATFORMS:
        if pattern.search(url):
            return platform_id
    return "unknown"


def is_valid_url(url: str) -> bool:
    return url.startswith("http://") or url.startswith("https://")
