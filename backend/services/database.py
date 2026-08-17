"""
Database Service for DreamerDrop Web App & Admin Dashboard.
Supports Neon PostgreSQL (via DATABASE_URL env var) and local SQLite fallback.
"""

import os
import sqlite3
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "database.db")


def get_db_url() -> str:
    return os.environ.get("DATABASE_URL", "").strip()


def wants_postgres() -> bool:
    url = get_db_url()
    return bool(url and (url.startswith("postgresql://") or url.startswith("postgres://")) and "xxxxxxxxxxxx" not in url)


def get_db_connection():
    if wants_postgres():
        try:
            import psycopg2
            import psycopg2.extras
            url = get_db_url()
            conn = psycopg2.connect(url, cursor_factory=psycopg2.extras.RealDictCursor)
            return conn, True
        except Exception as e:
            print(f"[Database Warning] Neon PostgreSQL connection failed ({e}). Falling back to SQLite database.db.")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn, False


def init_db():
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    if is_pg:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                reference VARCHAR(255) UNIQUE NOT NULL,
                amount INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                source VARCHAR(50) DEFAULT 'web'
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS trials (
                id SERIAL PRIMARY KEY,
                client_id VARCHAR(255) UNIQUE NOT NULL,
                download_count INT DEFAULT 0,
                updated_at TIMESTAMP NOT NULL
            );
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS download_logs (
                id SERIAL PRIMARY KEY,
                url TEXT NOT NULL,
                platform VARCHAR(50) NOT NULL,
                quality_id VARCHAR(50) DEFAULT 'auto',
                client_type VARCHAR(50) DEFAULT 'web',
                status VARCHAR(50) DEFAULT 'success',
                created_at TIMESTAMP NOT NULL
            );
            """
        )
        print("[Database] Initialized Neon PostgreSQL schema successfully!")
    else:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                reference TEXT UNIQUE NOT NULL,
                amount INTEGER NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                source TEXT DEFAULT 'web'
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS trials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT UNIQUE NOT NULL,
                download_count INTEGER DEFAULT 0,
                updated_at TEXT NOT NULL
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS download_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT NOT NULL,
                platform TEXT NOT NULL,
                quality_id TEXT DEFAULT 'auto',
                client_type TEXT DEFAULT 'web',
                status TEXT DEFAULT 'success',
                created_at TEXT NOT NULL
            )
            """
        )
        # Migration for existing SQLite database files
        try:
            cursor.execute("ALTER TABLE payments ADD COLUMN source TEXT DEFAULT 'web'")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE download_logs ADD COLUMN client_type TEXT DEFAULT 'web'")
        except Exception:
            pass

        print("[Database] Initialized local SQLite schema successfully!")


    conn.commit()
    conn.close()


def record_payment(email: str, reference: str, amount: int, status: str = "success", days: int = 30, source: str = "web"):
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    expires_at = now + timedelta(days=days)

    now_str = now.isoformat()
    expires_str = expires_at.isoformat()

    if is_pg:
        cursor.execute(
            """
            INSERT INTO payments (email, reference, amount, status, created_at, expires_at, source)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (reference) DO UPDATE SET status = EXCLUDED.status, expires_at = EXCLUDED.expires_at
            """,
            (email.strip().lower(), reference.strip(), amount, status, now, expires_at, source),
        )
    else:
        cursor.execute(
            """
            INSERT OR REPLACE INTO payments (email, reference, amount, status, created_at, expires_at, source)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (email.strip().lower(), reference.strip(), amount, status, now_str, expires_str, source),
        )

    conn.commit()
    conn.close()
    return {"email": email, "reference": reference, "expires_at": expires_str}


def is_subscribed(email: str) -> bool:
    if not email or not email.strip():
        return False

    email_clean = email.strip().lower()
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    now_str = now.isoformat()

    if is_pg:
        cursor.execute(
            "SELECT * FROM payments WHERE LOWER(email) = %s AND status = 'success' AND expires_at > %s ORDER BY expires_at DESC LIMIT 1",
            (email_clean, now),
        )
    else:
        cursor.execute(
            "SELECT * FROM payments WHERE LOWER(email) = ? AND status = 'success' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
            (email_clean, now_str),
        )

    row = cursor.fetchone()
    conn.close()

    return row is not None


def get_subscription_details(email: str) -> dict | None:
    if not email:
        return None

    email_clean = email.strip().lower()
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    now_str = now.isoformat()

    if is_pg:
        cursor.execute(
            "SELECT * FROM payments WHERE LOWER(email) = %s AND status = 'success' AND expires_at > %s ORDER BY expires_at DESC LIMIT 1",
            (email_clean, now),
        )
    else:
        cursor.execute(
            "SELECT * FROM payments WHERE LOWER(email) = ? AND status = 'success' AND expires_at > ? ORDER BY expires_at DESC LIMIT 1",
            (email_clean, now_str),
        )

    row = cursor.fetchone()
    conn.close()

    if row:
        return dict(row)
    return None


def get_trial_count(client_id: str) -> int:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    if is_pg:
        cursor.execute("SELECT download_count FROM trials WHERE client_id = %s", (client_id,))
    else:
        cursor.execute("SELECT download_count FROM trials WHERE client_id = ?", (client_id,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return int(row["download_count"])
    return 0


def increment_trial_count(client_id: str) -> int:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    now_str = now.isoformat()
    current = get_trial_count(client_id)
    new_count = current + 1

    if is_pg:
        cursor.execute(
            """
            INSERT INTO trials (client_id, download_count, updated_at)
            VALUES (%s, %s, %s)
            ON CONFLICT(client_id) DO UPDATE SET download_count = EXCLUDED.download_count, updated_at = EXCLUDED.updated_at
            """,
            (client_id, new_count, now),
        )
    else:
        cursor.execute(
            """
            INSERT INTO trials (client_id, download_count, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(client_id) DO UPDATE SET download_count = ?, updated_at = ?
            """,
            (client_id, new_count, now_str, new_count, now_str),
        )

    conn.commit()
    conn.close()
    return new_count


def log_download(url: str, platform: str, quality_id: str = "auto", client_type: str = "web"):
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    now_str = now.isoformat()

    try:
        if is_pg:
            cursor.execute(
                "INSERT INTO download_logs (url, platform, quality_id, client_type, status, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                (url[:500], platform, quality_id, client_type, "success", now),
            )
        else:
            cursor.execute(
                "INSERT INTO download_logs (url, platform, quality_id, client_type, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (url[:500], platform, quality_id, client_type, "success", now_str),
            )
        conn.commit()
        print(f"[Database] Logged download: {platform} ({client_type})")
    except Exception as e:
        print(f"[Database Log Error] Failed to log download: {e}")
    finally:
        conn.close()


def get_admin_stats() -> dict:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    now = datetime.utcnow()
    now_str = now.isoformat()
    today_start = datetime(now.year, now.month, now.day).isoformat()

    # 1. Total Revenue in Naira (Paystack amount is in kobo, divide by 100)
    cursor.execute("SELECT COALESCE(SUM(amount), 0) as total_kobo FROM payments WHERE status = 'success'")
    row = cursor.fetchone()
    total_kobo = row["total_kobo"] if row else 0
    total_revenue_naira = int(total_kobo) / 100.0

    # 2. Active Subscribers Count
    if is_pg:
        cursor.execute("SELECT COUNT(DISTINCT email) as active_subs FROM payments WHERE status = 'success' AND expires_at > %s", (now,))
    else:
        cursor.execute("SELECT COUNT(DISTINCT email) as active_subs FROM payments WHERE status = 'success' AND expires_at > ?", (now_str,))
    active_subscribers = cursor.fetchone()["active_subs"]

    # 3. Total Downloads Count
    cursor.execute("SELECT COUNT(*) as total_downloads FROM download_logs")
    total_downloads = cursor.fetchone()["total_downloads"]

    # 4. Today Downloads Count
    if is_pg:
        cursor.execute("SELECT COUNT(*) as today_downloads FROM download_logs WHERE created_at >= %s", (datetime(now.year, now.month, now.day),))
    else:
        cursor.execute("SELECT COUNT(*) as today_downloads FROM download_logs WHERE created_at >= ?", (today_start,))
    today_downloads = cursor.fetchone()["today_downloads"]

    # 5. Downloads Breakdown by Platform
    cursor.execute("SELECT platform, COUNT(*) as count FROM download_logs GROUP BY platform ORDER BY count DESC")
    platform_rows = cursor.fetchall()
    platform_breakdown = {r["platform"]: r["count"] for r in platform_rows}

    # 6. Downloads Breakdown by Client Type (Web vs Mobile)
    cursor.execute("SELECT client_type, COUNT(*) as count FROM download_logs GROUP BY client_type")
    client_rows = cursor.fetchall()
    client_breakdown = {r["client_type"]: r["count"] for r in client_rows}

    conn.close()

    return {
        "totalRevenueNaira": total_revenue_naira,
        "activeSubscribers": active_subscribers,
        "totalDownloads": total_downloads,
        "todayDownloads": today_downloads,
        "platformBreakdown": platform_breakdown,
        "clientBreakdown": client_breakdown,
        "databaseEngine": "PostgreSQL (Neon)" if is_pg else "SQLite (Local)"
    }


def get_recent_transactions(limit: int = 20) -> list[dict]:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    if is_pg:
        cursor.execute("SELECT * FROM payments ORDER BY id DESC LIMIT %s", (limit,))
    else:
        cursor.execute("SELECT * FROM payments ORDER BY id DESC LIMIT ?", (limit,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_download_activity(limit: int = 30) -> list[dict]:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    if is_pg:
        cursor.execute("SELECT * FROM download_logs ORDER BY id DESC LIMIT %s", (limit,))
    else:
        cursor.execute("SELECT * FROM download_logs ORDER BY id DESC LIMIT ?", (limit,))

    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_subscribers() -> list[dict]:
    conn, is_pg = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT email, MAX(expires_at) as expires_at, MAX(created_at) as created_at, MAX(source) as source
        FROM payments
        WHERE status = 'success'
        GROUP BY email
        ORDER BY expires_at DESC
        """
    )

    rows = cursor.fetchall()
    conn.close()

    now_iso = datetime.utcnow().isoformat()
    subscribers = []
    for r in rows:
        item = dict(r)
        exp = str(item.get("expires_at", ""))
        item["active"] = exp > now_iso
        subscribers.append(item)

    return subscribers
