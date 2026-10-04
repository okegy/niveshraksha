# Deployment Guide — NiveshRaksha / SENTINEL-X

Current live deployment (hackathon demo):

| Piece | Where | URL |
|---|---|---|
| Frontend (SENTINEL-X portal + app) | **Vercel** | https://niveshraksha-sentinel-x.vercel.app |
| Backend (FastAPI engine) | Local machine → **cloudflared quick tunnel** | https://maker-fig-chair-beans.trycloudflare.com (ephemeral — see below) |

## How it was deployed (copy-paste reproduction)

### 1. Backend: local process + public tunnel

```bash
# from workspace/niveshraksha/backend — keep this terminal open
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# in a second terminal — free, no-signup public HTTPS URL
agent_tools/cloudflared/cloudflared.exe tunnel --url http://localhost:8000
# → note the printed https://<random-words>.trycloudflare.com URL
```

Quick tunnels are **ephemeral**: the URL changes every time cloudflared restarts.
For a stable URL use a named tunnel (free Cloudflare account):

```bash
cloudflared tunnel login
cloudflared tunnel create niveshraksha
cloudflared tunnel route dns niveshraksha api.yourdomain.com   # or a cf argo URL
cloudflared tunnel run niveshraksha
```

### 2. Frontend: Vercel

```bash
npm i -g vercel
cd workspace/niveshraksha/frontend
vercel link --yes --project niveshraksha-sentinel-x

# point the browser bundle at the backend URL (build-time inline)
printf "https://<your-tunnel-url>" | vercel env add NEXT_PUBLIC_API_BASE_URL production

vercel deploy --prod --yes
```

⚠ After changing `NEXT_PUBLIC_API_BASE_URL` you must **redeploy** — it is inlined at build time.

### 3. CORS

The backend allowlist (`app/main.py`) accepts localhost, private LAN ranges, and
`*.vercel.app` origins. Tighten it to your exact production origin before any
public use.

## When the tunnel URL changes (quick tunnels do)

1. Restart `cloudflared tunnel --url http://localhost:8000`, note the new URL.
2. `printf "<new-url>" | vercel env add NEXT_PUBLIC_API_BASE_URL production`
3. `vercel deploy --prod --yes`

## Production upgrade path (recommended post-hackathon)

| Concern | Demo state | Production fix |
|---|---|---|
| Backend hosting | local machine + tunnel | Render/Railway/Fly/VPS running the Dockerfile; PostgreSQL via `NIVESHRAKSHA_DATABASE_URL` |
| Persistent storage | SQLite file | PostgreSQL (schema in `docs/DATABASE_SCHEMA.sql`) |
| Secrets | `.env` local | Host's secret manager (`SARVAM_API_KEY`, `CHAT_HISTORY_SERVER_SECRET`, …) |
| CORS | regex demo allowlist | exact production origins |
| Rate limiting | in-memory per-process | shared store (Redis) |
| OCR/models in serverless | heavy for lambda limits | keep backend on a long-running host |

## What was verified on the live deployment

- Portal renders (hero, feed cards, demo banner) at the vercel.app URL
- Live crypto-address scan from the deployed site scores via the tunnel (SUSPICIOUS + guidance), zero API errors
- CORS preflight from the Vercel origin: 200
- Backend reachable through the tunnel: health, threat feed, message analysis with model metadata

Screenshot: `docs/images/vercel-deployed.png`.
