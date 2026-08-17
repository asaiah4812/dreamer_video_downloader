import time

_store: dict[str, tuple[float, dict]] = {}


def get_cache(key: str, ttl_seconds: int) -> dict | None:
    entry = _store.get(key)
    if not entry:
        return None
    expires_at, value = entry
    if time.time() > expires_at:
        _store.pop(key, None)
        return None
    return value


def set_cache(key: str, value: dict, ttl_seconds: int) -> None:
    _store[key] = (time.time() + ttl_seconds, value)
