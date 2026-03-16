# Backend Deployment Guide — Step by Step (Beginner Friendly)

This guide takes you from running the API on your laptop to running it on the internet.

**Prerequisites**: You have a GitHub account and a web browser. That's it.

---

## Part 1: Run the Backend Locally (5 minutes)

### Step 1.1 — Open a terminal

On Windows, open **Git Bash** or **PowerShell** and navigate to the project:

```bash
cd C:\Users\u22872966\Desktop\StreamlitProject
```

### Step 1.2 — Install Python dependencies

```bash
pip install fastapi uvicorn pydantic pydantic-settings python-multipart PyJWT bcrypt passlib httpx pandas numpy
```

If you see "Requirement already satisfied" for most of them — that's fine, they're already installed.

### Step 1.3 — Start the API server

```bash
python -m uvicorn api.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 1.4 — Test it works

Open your browser and go to:

- **http://localhost:8000/health** → You should see `{"status":"healthy",...}`
- **http://localhost:8000/docs** → You should see the Swagger UI (interactive API docs)

### Step 1.5 — Test the login

In the Swagger UI at `http://localhost:8000/docs`:

1. Click on **POST /api/auth/login**
2. Click "Try it out"
3. Enter this body:
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
4. Click "Execute"
5. You should see a response with `"access_token": "eyJ..."` — that's your JWT token

**Congratulations — your backend works locally!** Press `Ctrl+C` in the terminal to stop it.

---

## Part 2: Push Code to GitHub (10 minutes)

Your code needs to be on GitHub so cloud services can deploy it.

### Step 2.1 — Check your git status

```bash
git status
```

You should see untracked files (the new frontend/, docker/, .github/ files we created).

### Step 2.2 — Create a `.gitignore` check

Make sure these are in your `.gitignore` (they already should be):
```
.env
.streamlit/secrets.toml
frontend/node_modules/
forecast_env_py311/
pipeline_artifacts/
```

### Step 2.3 — Stage and commit all new files

```bash
# Stage all new files
git add frontend/src/ frontend/package.json frontend/package-lock.json frontend/tsconfig.json
git add frontend/next.config.ts frontend/postcss.config.mjs frontend/vitest.config.mts
git add frontend/playwright.config.ts frontend/vercel.json frontend/eslint.config.mjs
git add frontend/__tests__/
git add api/routes/jobs.py api/workers/
git add tests/api/
git add docker/ docker-compose.yml
git add .github/ .pre-commit-config.yaml
git add requirements-api.txt ruff.toml railway.toml
git add .env.example DEPLOY_GUIDE.md CLAUDE.md
git add scripts/auto_commit.sh
git add frontend/src/middleware.ts frontend/src/components/layout/

# Check what will be committed
git status

# Commit
git commit -m "feat: complete Next.js frontend migration (Phases 0-6)

- 11 frontend pages (login, dashboard, upload, prepare, explore, train, results, forecast, staff, supply, actions)
- Sidebar navigation component
- Celery background workers for ML training
- WebSocket job progress endpoint
- Docker + CI/CD + deployment configs
- 41 tests (30 Vitest + 11 pytest)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

### Step 2.4 — Create a GitHub repository (if you don't have one)

1. Go to **https://github.com/new**
2. Name it `healthforecast-ai` (or any name)
3. Set it to **Private** (thesis work)
4. Do NOT initialize with README (you already have one)
5. Click "Create repository"

### Step 2.5 — Push to GitHub

```bash
# If this is a new repo:
git remote add origin https://github.com/YOUR_USERNAME/healthforecast-ai.git
git push -u origin main

# If you already have a remote:
git push origin main
```

---

## Part 3: Deploy Backend to Railway (15 minutes)

Railway is the simplest way to deploy a Python API. It gives you a URL like `https://your-app.railway.app`.

### Step 3.1 — Create a Railway account

1. Go to **https://railway.app**
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### Step 3.2 — Create a new project

1. Click **"New Project"** on the Railway dashboard
2. Click **"Deploy from GitHub Repo"**
3. Select your `healthforecast-ai` repository
4. Railway will detect the project

### Step 3.3 — Configure the service

Railway will try to auto-detect the build. We need to tell it to use our Dockerfile.

1. Click on the service that was created
2. Go to **Settings** tab
3. Under **Build**, set:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `docker/Dockerfile.api`
   - **Watch Paths**: `api/`, `app_core/`, `requirements*.txt`

4. Under **Deploy**, set:
   - **Start Command**: `uvicorn api.main:app --host 0.0.0.0 --port $PORT --workers 2`

### Step 3.4 — Add environment variables

1. Click on **Variables** tab
2. Click **"New Variable"** and add each one:

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | `mysupersecretkey123changethis` | Any random string. For production, use `openssl rand -hex 32` |
| `DEBUG` | `false` | |
| `SUPABASE_URL` | (your Supabase URL) | From `.streamlit/secrets.toml` |
| `SUPABASE_KEY` | (your Supabase key) | From `.streamlit/secrets.toml` |
| `LLM_PROVIDER` | `anthropic` | |
| `LLM_API_KEY` | (your API key) | Optional — only needed for Action Center |
| `CORS_ORIGINS` | `["https://your-frontend.vercel.app","http://localhost:3000"]` | Update after frontend deploy |
| `PORT` | `8000` | Railway sets this automatically, but add it to be safe |

### Step 3.5 — Deploy

1. Railway auto-deploys when you push to GitHub
2. Or click **"Deploy"** manually
3. Wait 2-5 minutes for the build

### Step 3.6 — Get your public URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://healthforecast-api-production.up.railway.app`

### Step 3.7 — Test the deployed API

Open your browser and go to:

```
https://YOUR-RAILWAY-URL/health
```

You should see:
```json
{"status":"healthy","app":"HealthForecast AI API","version":"1.0.0"}
```

Then try the Swagger docs:
```
https://YOUR-RAILWAY-URL/docs
```

**Your API is now live on the internet!**

---

## Part 4: Add Redis (Optional — for background ML training)

If you want the Celery background workers (for non-blocking model training), you need Redis.

### Step 4.1 — Add Redis service

1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"Redis"**
2. Railway creates a Redis instance automatically

### Step 4.2 — Connect Redis to your API

1. Click on your API service → **Variables**
2. Click **"Add Reference Variable"**
3. Select the Redis service → `REDIS_URL`
4. This automatically injects the Redis connection string

### Step 4.3 — Add Celery worker service

1. Click **"+ New"** → **"GitHub Repo"** → select the same repo
2. In **Settings**:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `docker/Dockerfile.api` (same image)
   - **Start Command**: `celery -A api.workers.celery_app worker --loglevel=info --concurrency=2`
3. Add the **same environment variables** as the API service
4. Add the **Redis reference variable** too

---

## Part 5: Alternative — Deploy Without Docker (Simpler)

If Docker builds fail or take too long, Railway can deploy directly from Python:

### Step 5.1 — Create a `Procfile` in the project root

```
web: uvicorn api.main:app --host 0.0.0.0 --port $PORT --workers 2
```

### Step 5.2 — Create a `runtime.txt`

```
python-3.11.0
```

### Step 5.3 — Push and deploy

Railway will detect the Procfile and build from source instead of Docker.

---

## Part 6: Verify Everything Works

### Test 1 — Health check
```
GET https://YOUR-URL/health
Expected: {"status":"healthy",...}
```

### Test 2 — Login
```
POST https://YOUR-URL/api/auth/login
Body: {"username":"admin","password":"admin123"}
Expected: {"access_token":"eyJ...",...}
```

### Test 3 — Swagger docs
```
GET https://YOUR-URL/docs
Expected: Interactive Swagger UI page
```

### Test 4 — Upload data (with token)
```bash
# Get token first
TOKEN=$(curl -s -X POST https://YOUR-URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Upload a CSV file
curl -X POST https://YOUR-URL/api/data/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@data/your_patient_data.csv" \
  -F "dataset_type=patient"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Railway build fails | Check the build logs. Most common: missing dependency in requirements.txt |
| "Module not found" error | Make sure all deps are in `requirements.txt` AND `requirements-api.txt` |
| CORS errors from frontend | Update `CORS_ORIGINS` env var to include your frontend URL |
| Login returns 401 | Check that `SECRET_KEY` env var is set. Use `admin` / `admin123` |
| Swagger UI shows no endpoints | Check that `api/main.py` imports all routers correctly |
| Redis connection refused | Make sure Redis service is running and `REDIS_URL` is set |
| API works locally but not on Railway | Check the **Logs** tab in Railway for the actual error |

---

## What You Have After Deployment

```
https://YOUR-RAILWAY-URL/
├── /health                     → Health check
├── /docs                       → Swagger API documentation
├── /api/auth/login             → Login (POST)
├── /api/auth/me                → Current user info (GET)
├── /api/data/upload            → Upload CSV/Excel (POST)
├── /api/data/validate          → Validate dataset (POST)
├── /api/data/fuse              → Merge datasets (POST)
├── /api/data/explore           → EDA statistics (POST)
├── /api/data/features/engineer → Feature engineering (POST)
├── /api/data/datasets          → List datasets (GET)
├── /api/models/train           → Train ML model (POST)
├── /api/models/train/baseline  → Train ARIMA/SARIMAX (POST)
├── /api/models/compare/{id}    → Compare models (GET)
├── /api/forecast/predict       → Generate forecast (POST)
├── /api/optimize/staff         → Staff scheduling MILP (POST)
├── /api/optimize/inventory     → Inventory optimization (POST)
├── /api/jobs/train             → Submit background training (POST)
├── /api/jobs/{id}              → Poll job status (GET)
└── /api/kpi/dashboard/{id}     → Dashboard KPIs (GET)
```

---

## Next Step: Deploy the Frontend

Once your backend is deployed and you have the Railway URL, you'll use it as `NEXT_PUBLIC_API_URL` when deploying the Next.js frontend to Vercel. That's the next guide!

---

## Cost

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | $5 free credit/month | $5-25/month for hobby |
| Redis on Railway | Included in credit | — |
| GitHub | Free (private repos) | — |
| **Total for prototype** | **$0-5/month** | |
