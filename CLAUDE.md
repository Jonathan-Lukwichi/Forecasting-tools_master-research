# CLAUDE.md — HealthForecast AI

## Thesis Context

This project is **thesis work**. All development MUST follow academic rigor:

- **Reproducibility**: Deterministic seeds, pinned dependencies, Docker environments, documented setup
- **Testing**: Unit + integration + E2E tests. Minimum 80% coverage on new code. No untested code merged
- **Traceability**: Every architectural decision documented with rationale
- **Statistical rigour**: Proper train/cal/test splits, conformal prediction intervals, cross-validated metrics
- **Version control**: Atomic commits, conventional commit messages, no force pushes to main

---

## Project Overview

**HealthForecast AI** — Enterprise hospital resource planning and forecasting platform.

- ML/OR-based prediction of Emergency Department (ED) patient arrivals
- MILP optimization for staff scheduling and inventory management
- LLM-powered action recommendations (Claude + GPT)

**Architecture**: Migrating from monolithic Streamlit to decoupled Next.js frontend + FastAPI backend.

**Workflow**: Upload → Prepare → Explore → Train → Forecast → Optimize → Act

**Clinical Categories**: RESPIRATORY, CARDIAC, TRAUMA, GASTROINTESTINAL, INFECTIOUS, NEUROLOGICAL, OTHER

---

## System Architecture (Current → Target)

```
CURRENT (Monolithic Streamlit)          TARGET (Decoupled)
┌─────────────────────────┐             ┌─────────────────────────────┐
│  Streamlit (Python)     │             │  Next.js 16 (Vercel)        │
│  - 13 pages + Welcome   │             │  - React 19 + TypeScript 5  │
│  - st.session_state     │    ──→      │  - Tailwind CSS 4           │
│  - st.markdown(HTML/CSS)│             │  - Zustand + TanStack Query │
│  - Plotly charts        │             │  - Recharts + react-plotly  │
├─────────────────────────┤             ├─────────────────────────────┤
│  app_core/ (Python)     │             │  FastAPI (Railway/Render)   │
│  - ML pipelines         │             │  - REST API + WebSocket     │
│  - MILP solvers         │    ──→      │  - Celery + Redis workers   │
│  - Data processing      │             │  - app_core/ (unchanged)    │
│  - Supabase client      │             │  - Background job queue     │
└─────────────────────────┘             ├─────────────────────────────┤
                                        │  Data Layer                 │
                                        │  - Supabase (PostgreSQL)    │
                                        │  - Supabase Auth + Storage  │
                                        │  - Redis (cache + queue)    │
                                        └─────────────────────────────┘
```

---

## Repository Structure

```
healthforecast-ai/
├── CLAUDE.md                           # This file — project instructions
│
├── frontend/                           # Next.js 16 frontend (NEW)
│   ├── src/
│   │   ├── app/                        # Next.js App Router pages
│   │   │   ├── layout.tsx              # Root layout (Inter + JetBrains Mono)
│   │   │   ├── globals.css             # Tailwind CSS + design tokens
│   │   │   ├── login/page.tsx          # Auth page ✅ DONE
│   │   │   ├── dashboard/page.tsx      # Executive dashboard ✅ DONE
│   │   │   ├── upload/page.tsx         # Data upload ✅ DONE
│   │   │   ├── prepare/page.tsx        # Data fusion ⬜ Phase 2
│   │   │   ├── explore/page.tsx        # EDA ⬜ Phase 2
│   │   │   ├── features/page.tsx       # Feature engineering ⬜ Phase 3
│   │   │   ├── selection/page.tsx      # Feature selection ⬜ Phase 3
│   │   │   ├── baseline/page.tsx       # ARIMA/SARIMAX ⬜ Phase 3
│   │   │   ├── train/page.tsx          # ML training (4 tabs) ⬜ Phase 3
│   │   │   ├── results/page.tsx        # Model comparison ⬜ Phase 3
│   │   │   ├── forecast/page.tsx       # 7-day forecast ⬜ Phase 4
│   │   │   ├── staff/page.tsx          # Staff planner ⬜ Phase 4
│   │   │   ├── supply/page.tsx         # Supply planner ⬜ Phase 4
│   │   │   └── actions/page.tsx        # AI recommendations ⬜ Phase 5
│   │   ├── components/                 # Reusable React components
│   │   │   ├── ui/                     # Base UI components (Button, Card, etc.)
│   │   │   ├── dashboard/             # Dashboard-specific components ✅
│   │   │   ├── charts/                # Chart wrappers
│   │   │   └── layout/               # Sidebar, header, nav
│   │   ├── hooks/                      # Custom React hooks
│   │   │   ├── useAuth.ts             # Authentication context
│   │   │   ├── useJobProgress.ts      # WebSocket training progress
│   │   │   └── useDatasets.ts         # Dataset CRUD operations
│   │   ├── lib/                        # Utilities
│   │   │   ├── api.ts                 # API client ✅ EXISTS
│   │   │   ├── types.ts              # TypeScript interfaces (from Pydantic)
│   │   │   └── constants.ts          # Design tokens, config
│   │   └── stores/                    # Zustand state stores
│   │       └── pipeline.ts           # Pipeline state (mirrors typed_state.py)
│   ├── __tests__/                     # Frontend tests
│   │   ├── unit/                      # Component unit tests (Vitest)
│   │   ├── integration/              # API integration tests
│   │   └── e2e/                      # End-to-end tests (Playwright)
│   ├── package.json                   # Pinned dependencies
│   ├── next.config.ts                 # API proxy + config
│   ├── tsconfig.json                  # TypeScript config
│   ├── vitest.config.ts              # Test runner config
│   └── playwright.config.ts          # E2E test config
│
├── api/                                # FastAPI backend
│   ├── main.py                        # App initialization, CORS, middleware
│   ├── config.py                      # Settings (env-based, Pydantic)
│   ├── dependencies.py                # JWT auth, OAuth2, dependency injection
│   ├── routes/                        # API route modules
│   │   ├── auth.py                    # POST /login, GET /me
│   │   ├── data.py                    # Upload, validate, fuse, feature engineer
│   │   ├── models.py                  # Train ML/baseline, compare
│   │   ├── forecast.py                # Predict with intervals
│   │   ├── optimization.py            # Staff MILP, inventory MILP
│   │   └── kpi.py                     # Dashboard metrics
│   ├── schemas/                       # Pydantic request/response contracts
│   │   ├── auth.py                    # LoginRequest, TokenResponse, UserInfo
│   │   ├── data.py                    # Upload, Validate, Fuse, FeatureEng
│   │   ├── ml.py                      # Train, Forecast, TrainProgressEvent
│   │   ├── kpi.py                     # ForecastKPIResponse
│   │   └── optimization.py            # Staff/Inventory optimize contracts
│   ├── services/                      # API service layer
│   │   └── dataset_store.py           # In-memory store (→ Redis + PostgreSQL)
│   └── workers/                       # Celery background workers ⬜ Phase 3
│       ├── celery_app.py              # Celery configuration
│       ├── training_tasks.py          # ML training tasks
│       └── optimization_tasks.py      # MILP optimization tasks
│
├── app_core/                           # Backend business logic (PYTHON — DO NOT REWRITE)
│   ├── ai/                            # LLM recommendation engine
│   ├── analytics/                     # EDA + seasonal proportions
│   ├── api/                           # External API connectors
│   ├── auth/                          # Streamlit auth (legacy)
│   ├── cache/                         # Disk-based caching
│   ├── data/                          # Data processing, fusion, Supabase services
│   ├── errors/                        # Custom exceptions + handlers
│   ├── logging/                       # Structured logging
│   ├── models/                        # Forecasting models (8 models)
│   │   ├── arima_pipeline.py          # ARIMA
│   │   ├── sarimax_pipeline.py        # SARIMAX
│   │   └── ml/                        # XGBoost, LSTM, ANN, 3 Hybrids
│   ├── offline/                       # Offline mode (SQLite fallback)
│   ├── optimization/                  # PuLP MILP solvers
│   ├── pipelines/                     # Temporal split, conformal prediction
│   ├── services/                      # Business logic services
│   ├── state/                         # Typed state containers (Streamlit)
│   └── ui/                            # Streamlit UI components (legacy)
│
├── pages/                              # Streamlit pages (LEGACY — being replaced)
│   ├── 01_Dashboard.py ... 13_Action_Center.py
│
├── Welcome.py                          # Streamlit entry point (LEGACY)
│
├── tests/                              # Python test suite
│   ├── conftest.py                    # Shared fixtures (seed=42)
│   ├── unit/                          # Unit tests
│   └── integration/                   # Integration tests
│
├── docker/                             # Docker configurations ⬜
│   ├── Dockerfile.api                 # FastAPI + Celery image
│   ├── Dockerfile.frontend            # Next.js image
│   └── docker-compose.yml             # Full stack local dev
│
├── scripts/                            # Utility scripts
├── data/                               # Sample data files
├── pipeline_artifacts/                 # Saved model artifacts (.pkl, .h5)
├── .env                                # Environment variables (gitignored)
├── .env.example                        # Template for .env
├── requirements.txt                    # Python dependencies (pinned)
├── render.yaml                         # Render deployment (Streamlit — legacy)
└── .github/workflows/                  # CI/CD pipelines ⬜
    ├── ci.yml                         # Lint + test on PR
    ├── deploy-api.yml                 # Deploy FastAPI to Railway/Render
    └── deploy-frontend.yml            # Deploy Next.js to Vercel
```

---

## Technology Stack

### Frontend (Next.js)

| Concern | Technology | Version | Purpose |
|---------|-----------|---------|---------|
| Framework | Next.js (App Router) | 16.1.6 | SSR + React Server Components |
| Language | TypeScript | 5.x | Type safety |
| UI | React | 19.2.3 | Component framework |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Charts (primary) | Recharts | 3.8.x | Dashboard visualizations |
| Charts (advanced) | react-plotly.js | - | EDA, model diagnostics (add Phase 2) |
| Icons | Lucide React | 0.577.x | Consistent icon system |
| Server state | TanStack Query | 5.x | Data fetching, caching, mutations |
| Client state | Zustand | 5.x | Cross-page pipeline state |
| Forms | React Hook Form + Zod | - | Validated config forms |
| Tables | TanStack Table | 8.x | Data display |
| Real-time | WebSocket (native) | - | Training progress |
| Auth | Supabase Auth + Middleware | - | JWT, MFA, RLS |
| Unit tests | Vitest + Testing Library | - | Component tests |
| E2E tests | Playwright | - | Full workflow tests |
| Fonts | Inter + JetBrains Mono | - | Match design system |

### Backend (FastAPI + Python)

| Concern | Technology | Purpose |
|---------|-----------|---------|
| Framework | FastAPI | REST API + WebSocket |
| Language | Python | 3.11 (TensorFlow req.) |
| Auth | JWT (PyJWT) + Supabase Auth | Token-based auth |
| Background jobs | Celery + Redis | Async ML training + optimization |
| Database | Supabase (PostgreSQL) | Primary persistence |
| Cache | Redis | DataFrame cache, job queue |
| Storage | Supabase Storage | Model artifacts, uploads |
| Statistical | statsmodels, pmdarima | ARIMA/SARIMAX |
| ML/DL | TensorFlow/Keras, XGBoost, scikit-learn | LSTM, ANN, XGBoost |
| Optimization | PuLP | MILP staff + inventory |
| Tuning | Optuna | Bayesian hyperparameter optimization |
| LLM | Anthropic SDK, OpenAI SDK | AI recommendations |
| Testing | pytest + pytest-cov | Unit + integration tests |
| Validation | Pydantic | Schema validation |

### Cloud Infrastructure

| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend | Vercel | Next.js hosting, CDN, preview deploys |
| API + Workers | Railway or Render | Docker containers, auto-scaling |
| Job Queue | Redis (Railway/Upstash) | Celery broker + cache |
| Database | Supabase | PostgreSQL + Auth + Storage |
| Monitoring | Sentry | Error tracking |
| CI/CD | GitHub Actions | Automated test + deploy |

---

## Migration Phases

### Phase 0 — Foundation (Infrastructure & Tooling)

**Goal**: Reproducible development environment.

**Tasks**:
1. Create `docker-compose.yml` with FastAPI + Redis + PostgreSQL services
2. Create `Dockerfile.api` (Python 3.11, pinned requirements)
3. Create `.env.example` with all required environment variables
4. Configure `next.config.ts` with API proxy (`/api/** → localhost:8000`)
5. Set up GitHub Actions CI: lint + type-check + test on every PR
6. Add `vitest.config.ts` and `playwright.config.ts` to frontend
7. Pin ALL dependency versions (no `^` or `~` in package.json)
8. Document local setup in README with exact reproduction steps

**Testing requirements**:
- `docker-compose up` must produce a fully working local environment
- CI pipeline must pass before any merge to main
- All environment variables documented in `.env.example`

**Acceptance criteria**:
- [ ] `docker-compose up` starts all services
- [ ] `npm run dev` proxies API calls to FastAPI
- [ ] `pytest` runs all existing tests (seed=42)
- [ ] `npm run test` runs Vitest suite
- [ ] GitHub Actions CI green on main

---

### Phase 1 — Core Shell + Authentication

**Goal**: Production-grade auth with app layout.

**Tasks**:
1. Integrate Supabase Auth into Next.js (replace `localStorage` JWT)
2. Add Next.js middleware for route protection
3. Build app shell: sidebar navigation, header, responsive layout
4. Modify FastAPI to verify Supabase JWTs (check `iss` claim)
5. Add RLS policies to Supabase tables for tenant isolation
6. Remove `DEMO_USERS` hardcoded credentials from `api/routes/auth.py`
7. Store tokens in HTTP-only cookies (not `localStorage` — XSS protection)

**Testing requirements**:
- Unit tests: Auth context provider, middleware redirect logic
- Integration tests: Login flow, token refresh, role-based access
- Security: Verify no tokens exposed in client-side JavaScript

**Acceptance criteria**:
- [ ] Login/logout with Supabase Auth
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin vs. user role differentiation
- [ ] HTTP-only cookie for session (no localStorage)
- [ ] FastAPI validates Supabase JWTs
- [ ] RLS policies on all data tables

---

### Phase 2 — Data Pipeline Pages

**Goal**: Upload → Prepare → Explore workflow in Next.js.

**Tasks**:
1. Extend Upload page with validation step and dataset type selection
2. Build Prepare Data page (dataset selector, fusion UI, preview table)
3. Build Explore Data page (distributions, correlations, missing values)
4. Add new API endpoint: `POST /api/data/explore` → EDA statistics
5. Replace in-memory `DatasetStore` with Redis (cache) + PostgreSQL (metadata)
6. Add file uploads to Supabase Storage (presigned URLs for large files)
7. Generate TypeScript types from Pydantic schemas (`openapi-typescript`)

**Testing requirements**:
- Unit tests: All React components with Vitest + Testing Library
- Integration tests: Upload → validate → fuse → explore workflow via API
- Backend tests: `DatasetStore` replacement with Redis mock
- Data validation: Schema checks on uploaded files

**Acceptance criteria**:
- [ ] Upload CSV/Excel/Parquet via drag-and-drop
- [ ] Fuse patient + weather + calendar datasets
- [ ] Interactive EDA (distributions, time series, correlation matrix)
- [ ] DatasetStore persists across API restarts (Redis + PostgreSQL)
- [ ] TypeScript types auto-generated from OpenAPI spec
- [ ] ≥80% test coverage on new frontend components

---

### Phase 3 — ML Training Pages (Critical Path)

**Goal**: Feature engineering, model training, and results — with async job processing.

**Tasks**:
1. **Add Celery + Redis** worker infrastructure
   - `api/workers/celery_app.py` — Celery config with Redis broker
   - `api/workers/training_tasks.py` — ML training as Celery tasks
   - `api/workers/optimization_tasks.py` — MILP as Celery tasks
2. **Add WebSocket endpoint** for training progress
   - `WS /api/ws/jobs/{job_id}` — stream `TrainProgressEvent` messages
   - Celery tasks publish progress to Redis pub/sub
   - FastAPI WebSocket handler subscribes and forwards to client
3. **Add background job API**:
   - `POST /api/jobs/train` → returns `{job_id, status: "queued"}`
   - `GET /api/jobs/{job_id}` → returns status + result
   - `DELETE /api/jobs/{job_id}` → cancel job
4. **Build frontend pages**:
   - Feature Studio: lag/target config, feature generation
   - Feature Selection: importance scores, SHAP values (new endpoint)
   - Baseline Models: ARIMA/SARIMAX config, order selection, training
   - Train Models: 4 tabs (Benchmarks, ML, Tuning, Hybrids)
   - Model Results: comparison table, actual-vs-predicted, residuals
5. **Add new API endpoints**:
   - `POST /api/features/select` — feature importance analysis
   - `GET /api/models/{id}/diagnostics` — residuals, predictions

**Testing requirements**:
- Unit tests: All Celery tasks with mocked Redis
- Integration tests: Full training pipeline (submit → poll → complete)
- WebSocket tests: Connection, message format, disconnection
- ML validation: Verify model metrics match expected ranges (seed=42)
- Regression tests: Ensure model outputs are deterministic

**Acceptance criteria**:
- [ ] Celery worker processes training in background
- [ ] WebSocket streams real-time progress to frontend
- [ ] All 8 models trainable via API (ARIMA, SARIMAX, XGBoost, LSTM, ANN, 3 Hybrids)
- [ ] Optuna hyperparameter tuning works asynchronously
- [ ] Model metrics displayed in comparison table
- [ ] Conformal prediction intervals computed
- [ ] Training is deterministic (same seed → same results)
- [ ] ≥80% test coverage on workers and new endpoints

---

### Phase 4 — Forecasting + Optimization

**Goal**: 7-day forecasts, staff scheduling, and inventory optimization.

**Tasks**:
1. Build Patient Forecast page (horizon selector, confidence intervals, category breakdown)
2. Build Staff Planner page (cost parameters, constraint config, schedule Gantt/grid)
3. Build Supply Planner page (item config, order schedule, reorder alerts)
4. Add new API endpoint: `POST /api/forecast/categories` — seasonal proportion breakdown
5. Make optimization endpoints async via Celery
6. Add solution download (CSV, PDF report)

**Testing requirements**:
- Unit tests: Forecast visualization components, optimization config forms
- Integration tests: Forecast → optimize → export workflow
- OR validation: Verify MILP solutions are feasible (all constraints satisfied)
- Statistical tests: Forecast accuracy against holdout data

**Acceptance criteria**:
- [ ] 7-day forecast with prediction intervals visualized
- [ ] Category breakdown via seasonal proportions
- [ ] Staff scheduling produces feasible MILP solution
- [ ] Inventory optimization with reorder alerts
- [ ] Async optimization (does not block API)
- [ ] CSV/PDF export of plans

---

### Phase 5 — Intelligence + Polish

**Goal**: AI recommendations, UX refinement, accessibility.

**Tasks**:
1. Build Action Center page (LLM recommendation cards)
2. Add new API endpoint: `POST /api/ai/recommendations`
3. Dashboard drill-down (click KPI → detail view)
4. Performance: code splitting, lazy loading, caching headers
5. Accessibility audit (WCAG 2.1 AA — required for healthcare)
6. Responsive design verification (tablet + mobile)
7. Dark/light theme toggle

**Testing requirements**:
- E2E tests: Full workflow (upload → train → forecast → optimize → act) with Playwright
- Accessibility: Axe or Lighthouse audit, keyboard navigation
- Performance: Lighthouse score ≥ 90 on all pages
- LLM tests: Verify recommendation format and error handling

**Acceptance criteria**:
- [ ] Action Center generates contextual recommendations
- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse performance ≥ 90
- [ ] Full E2E test suite passes
- [ ] Responsive on 1024px+ screens

---

### Phase 6 — Production Hardening + Deployment

**Goal**: Cloud deployment with monitoring, security, and reliability.

**Tasks**:
1. Deploy frontend to Vercel (connect GitHub repo)
2. Deploy API + Celery to Railway/Render (Docker)
3. Set up Redis on Railway/Upstash
4. Configure Supabase production project (Auth + Storage + RLS)
5. Set up Sentry error tracking (frontend + backend)
6. Add health check endpoints and uptime monitoring
7. Security audit (OWASP top 10, HIPAA considerations)
8. Load testing (k6 or Locust)
9. Database migration scripts (Supabase CLI)
10. Decommission Streamlit (remove `render.yaml` Streamlit deploy)

**Testing requirements**:
- Load tests: API handles 50 concurrent users
- Security: No secrets in client bundle, HTTPS everywhere, CSP headers
- Smoke tests: Post-deploy health checks
- Disaster recovery: Database backup verified

**Acceptance criteria**:
- [ ] Production URL accessible (frontend + API)
- [ ] All environment variables in deployment platform (not in code)
- [ ] Sentry capturing errors
- [ ] Health check endpoint returning 200
- [ ] Load test report documented
- [ ] Security audit checklist completed

---

## API Endpoints Reference

### Existing (in `api/routes/`)

```
Auth:
  POST   /api/auth/login              → TokenResponse
  GET    /api/auth/me                 → UserInfo

Data:
  POST   /api/data/upload             → UploadResponse
  POST   /api/data/validate           → ValidateResponse
  POST   /api/data/fuse               → FuseResponse
  POST   /api/data/features/engineer  → FeatureEngineeringResponse
  GET    /api/data/datasets           → list[DatasetInfo]
  GET    /api/data/datasets/{id}      → dict

Models:
  POST   /api/models/train            → TrainResponse
  POST   /api/models/train/baseline   → TrainResponse
  GET    /api/models/compare/{id}     → ModelComparisonResponse

Forecast:
  POST   /api/forecast/predict        → ForecastResponse

Optimization:
  POST   /api/optimize/staff          → StaffOptimizeResponse
  POST   /api/optimize/inventory      → InventoryOptimizeResponse

KPI:
  GET    /api/kpi/dashboard/{id}      → ForecastKPIResponse

Health:
  GET    /health                      → {status, version}
```

### New Endpoints Needed

```
EDA (Phase 2):
  POST   /api/data/explore            → EDAResponse (distributions, correlations, missing)

Features (Phase 3):
  POST   /api/features/select         → FeatureSelectionResponse (importance, SHAP)

Model Diagnostics (Phase 3):
  GET    /api/models/{id}/diagnostics  → DiagnosticsResponse (residuals, predictions)

Background Jobs (Phase 3):
  POST   /api/jobs/train              → {job_id, status}
  POST   /api/jobs/optimize           → {job_id, status}
  GET    /api/jobs/{id}               → JobStatusResponse
  DELETE /api/jobs/{id}               → {cancelled: bool}
  WS     /api/ws/jobs/{id}            → TrainProgressEvent stream

Forecast Categories (Phase 4):
  POST   /api/forecast/categories     → CategoryForecastResponse

AI Recommendations (Phase 5):
  POST   /api/ai/recommendations      → RecommendationResponse
```

---

## Development Commands

### Backend (Python)

```bash
# Activate environment
.\forecast_env_py311\Scripts\activate       # Windows
source forecast_env_py311/bin/activate      # Linux/Mac

# Run FastAPI
uvicorn api.main:app --reload --port 8000

# Run Celery worker (Phase 3+)
celery -A api.workers.celery_app worker --loglevel=info

# Run Streamlit (legacy, during migration)
streamlit run Welcome.py

# Run Python tests
pytest tests/ -v --cov=app_core --cov=api --cov-report=term-missing
pytest tests/unit/ -v                       # Unit only
pytest tests/integration/ -v                # Integration only

# Generate OpenAPI spec
python -c "from api.main import app; import json; print(json.dumps(app.openapi(), indent=2))" > openapi.json
```

### Frontend (Next.js)

```bash
cd frontend

# Install dependencies
npm ci                                      # Clean install (reproducible)

# Development
npm run dev                                 # http://localhost:3000

# Testing
npm run test                                # Vitest unit tests
npm run test:coverage                       # With coverage report
npm run test:e2e                           # Playwright E2E

# Build
npm run build                               # Production build
npm run lint                                # ESLint
npm run type-check                         # TypeScript check

# Generate types from API
npx openapi-typescript ../openapi.json -o src/lib/api-types.ts
```

### Docker (Full Stack)

```bash
# Start all services
docker-compose up -d

# Rebuild after dependency changes
docker-compose up --build

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Stop all
docker-compose down
```

---

## Testing Standards

### Python Tests (pytest)

**Location**: `tests/`

**Structure**:
```
tests/
├── conftest.py              # Shared fixtures (seed=42, sample data)
├── unit/                    # Fast, isolated tests
│   ├── test_data_service.py
│   ├── test_modeling_service.py
│   ├── test_temporal_split.py
│   └── test_conformal_prediction.py
├── integration/             # Multi-component tests
│   ├── test_data_pipeline.py
│   └── test_forecast_pipeline.py
└── api/                     # API endpoint tests ⬜
    ├── test_auth.py
    ├── test_data_routes.py
    ├── test_model_routes.py
    └── test_optimization_routes.py
```

**Rules**:
- ALL fixtures use `np.random.seed(42)` for reproducibility
- Use `pytest-cov` — minimum 80% coverage on new code
- Mock external services (Supabase, LLM APIs) — never call production in tests
- Use `conftest.py` fixtures for shared test data (already defined)
- API tests use `TestClient` from FastAPI
- ML tests verify deterministic outputs (same seed → same metrics)

### Frontend Tests (Vitest + Playwright)

**Structure**:
```
frontend/__tests__/
├── unit/                    # Vitest + Testing Library
│   ├── components/          # Component render tests
│   ├── hooks/               # Hook behavior tests
│   └── lib/                 # Utility function tests
├── integration/             # API integration tests
│   └── api-client.test.ts   # API client with MSW mocks
└── e2e/                     # Playwright browser tests
    ├── auth.spec.ts         # Login/logout flow
    ├── data-pipeline.spec.ts # Upload → prepare → explore
    ├── training.spec.ts     # Train → results
    └── optimization.spec.ts # Forecast → optimize → act
```

**Rules**:
- Use `@testing-library/react` for component tests (test behavior, not implementation)
- Use MSW (Mock Service Worker) for API mocking in unit/integration tests
- Playwright E2E tests run against a real frontend + mocked API
- Every new component MUST have a corresponding test file
- Test both success and error states
- Test loading states and empty states

---

## Design System

### Design Tokens (Tailwind CSS)

The Streamlit theme tokens map to Tailwind config:

```
Streamlit Python Constants    →    Tailwind CSS / globals.css
─────────────────────────────────────────────────────────────
PRIMARY_COLOR   = "#3b82f6"   →    blue-500
SECONDARY_COLOR = "#22d3ee"   →    cyan-400
ACCENT_PINK     = "#f43f5e"   →    rose-500
SUCCESS_COLOR   = "#22c55e"   →    green-500
WARNING_COLOR   = "#facc15"   →    yellow-400
DANGER_COLOR    = "#f97373"   →    red-400
TEXT_COLOR       = "#ffffff"   →    white
BODY_TEXT        = "#d1d5db"   →    gray-300
SUBTLE_TEXT      = "#94a3b8"   →    slate-400
CARD_BG          = "#0b1120"   →    --color-card-bg (custom)
BG_GRADIENT_START = "#020617"  →    slate-950 / --color-background
```

### Visual Patterns

- **Dark cinematic theme** with deep navy/black backgrounds
- **Glassmorphism**: `backdrop-blur-xl bg-white/5 border border-white/10`
- **Neon glow effects**: `shadow-[0_0_20px_rgba(59,130,246,0.3)]`
- **135deg gradients** consistently on all surfaces
- **Border radius**: `rounded-lg` (8px inputs), `rounded-xl` (12px cards), `rounded-2xl` (16px hero)
- **Typography**: Inter (body), JetBrains Mono (code/metrics)

---

## Coding Standards

### Python

- Type hints on all function signatures
- Docstrings on all public functions (Google style)
- `black` formatter, `ruff` linter
- Pydantic for all API contracts
- Abstract base classes for model pipelines
- Service layer pattern for business logic
- No `st.session_state` in new code (only in legacy Streamlit pages)
- Environment variables via `api/config.py` Settings class

### TypeScript

- Strict mode enabled (`"strict": true` in tsconfig)
- No `any` types — use `unknown` + type guards
- Props interfaces for all components
- Named exports (no default exports except pages)
- Custom hooks for reusable logic (`use*` prefix)
- Zod schemas for runtime validation at API boundaries
- TanStack Query for all data fetching (no raw `useEffect` + `fetch`)

### Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
- Branch naming: `feature/phase-N-description`, `fix/issue-description`
- PRs require: passing CI, ≥1 review, no failing tests
- No force pushes to `main`
- Squash merge for feature branches

---

## Environment Variables

All secrets and config in `.env` (never committed). Template in `.env.example`:

```bash
# API
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DEBUG=false

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key   # Server-side only

# LLM
LLM_PROVIDER=anthropic
LLM_API_KEY=your-api-key

# Redis (Phase 3+)
REDIS_URL=redis://localhost:6379/0

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Key File References

| Purpose | Current File | Migration Target |
|---------|-------------|-----------------|
| Entry point | `Welcome.py` | `frontend/src/app/page.tsx` |
| API client | — | `frontend/src/lib/api.ts` ✅ |
| API config | `api/config.py` | Same (extend) |
| API routes | `api/routes/*.py` | Same (add endpoints) |
| API schemas | `api/schemas/*.py` | Same → auto-generate TS types |
| Data processing | `app_core/data/data_processing.py` | Same (called by API) |
| Data fusion | `app_core/data/fusion.py` | Same (called by API) |
| ML base class | `app_core/models/ml/base_ml_pipeline.py` | Same (called by Celery) |
| MILP solvers | `app_core/optimization/milp_solver.py` | Same (called by Celery) |
| Session state | `app_core/state/typed_state.py` | `frontend/src/stores/pipeline.ts` |
| Design tokens | `app_core/ui/theme.py` | `frontend/src/app/globals.css` |
| Supabase client | `app_core/data/supabase_client.py` | `api/config.py` (env-based) |
| Test fixtures | `tests/conftest.py` | Same (seed=42) |

---

## Critical Rules

1. **NEVER rewrite `app_core/` in TypeScript.** ML/optimization stays in Python. The frontend communicates via the FastAPI REST API only.

2. **NEVER commit secrets.** No API keys, passwords, or tokens in source code. Use `.env` + environment variables. The FastAPI `api/config.py` Settings class loads from env.

3. **NEVER skip tests.** Every PR must include tests for new functionality. CI must be green before merge.

4. **ALWAYS use deterministic seeds.** `np.random.seed(42)`, `tf.random.set_seed(42)`, `random.seed(42)` in all ML code and test fixtures.

5. **ALWAYS pin dependency versions.** No `^` or `~` ranges. Use exact versions in `requirements.txt` and `package.json` for reproducibility.

6. **ALWAYS generate TypeScript types from Pydantic schemas.** Never manually duplicate API contracts. Use `openapi-typescript` to generate from the OpenAPI spec.

7. **ALWAYS use the service layer.** Frontend → API route → service/worker → app_core. No direct app_core imports from API routes (use services).

8. **ALWAYS handle errors gracefully.** API returns structured error responses. Frontend shows user-friendly error messages. Never expose stack traces.

9. **Background jobs for anything > 5 seconds.** Model training, optimization, and large data processing must use Celery. Never block the API process.

10. **Document every architectural decision.** If you choose approach A over B, write a comment or ADR explaining why. This is thesis work.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| TensorFlow import error | Ensure Python 3.11 env activated (`forecast_env_py311`) |
| API CORS error | Check `CORS_ORIGINS` in `.env` includes frontend URL |
| WebSocket connection fails | Ensure API is running and `WS_URL` points to correct host |
| Redis connection refused | Start Redis: `docker-compose up redis` or `redis-server` |
| Celery worker not picking up tasks | Check `REDIS_URL`, ensure worker is running |
| TypeScript type mismatch | Regenerate types: `npx openapi-typescript` |
| Supabase RLS blocks query | Check JWT claims include correct `role` |
| Frontend 401 redirect loop | Clear cookies, check token expiry |
| Model training not deterministic | Verify all seeds set (numpy, tensorflow, random) |
| Docker build fails | Check Python 3.11 in Dockerfile, `requirements.txt` pinned |
