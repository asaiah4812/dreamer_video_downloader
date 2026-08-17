# DreamerDrop Downloader

Cross-platform social media video downloader — **Expo SDK 56** app + **Flask** API with **yt-dlp**.

## Features

- Paste YouTube, TikTok, Instagram, Facebook, X, Threads, Vimeo, Dailymotion links
- One-tap circular download button with live progress
- Saves to app storage; optional gallery (dev build)
- BlackHole-inspired dark UI

## Quick start

### 1. Flask backend (required for social links)

**Install Python 3.10+**, then:

```bash
cd backend
pip install -r requirements.txt
pip install -U yt-dlp
copy .env.example .env
python app.py
```

API runs at `http://localhost:4000/api/v1`

Check: [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health) → `"ytdlp": true`

**FFmpeg** (optional, for audio conversion): install and add to PATH.

### 2. Mobile app

```bash
npm install
copy .env.example .env
npm start
```

#### Connect the phone to the API

| Device | `EXPO_PUBLIC_API_URL` in `.env` |
|--------|----------------------------------|
| Android emulator | `http://10.0.2.2:4000/api/v1` |
| iOS simulator | `http://localhost:4000/api/v1` |
| Physical phone | `http://YOUR_PC_LAN_IP:4000/api/v1` |

Use the same Wi‑Fi for phone and PC. Allow port **4000** in Windows Firewall.

Restart Expo after changing `.env`: `npx expo start -c`

## API endpoints

| Method | Path | Body |
|--------|------|------|
| GET | `/api/v1/health` | — |
| POST | `/api/v1/metadata` | `{ "url": "..." }` |
| POST | `/api/v1/download` | `{ "url", "qualityId", "format", "type" }` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Expo dev server |
| `npm run api` | Start Flask backend |
| `npm run typecheck` | TypeScript check |

## Legal

Only download content you have rights to. Respect platform Terms of Service and copyright laws.
