# CLAUDE.md — HealthForecast AI

## Thesis Context

This project is **thesis work**. All development MUST follow academic rigor:

- **Reproducibility**: Deterministic seeds, pinned dependencies, Docker environments, documented setup
- **Testing**: Unit + integration + E2E tests. Minimum 80% coverage on new code. No untested code merged
- **Traceability**: Every architectural decision documented with rationale
- **Statistical rigour**: Proper train/cal/test splits, conformal prediction intervals, cross-validated metrics
- **Version control**: Atomic commits, conventional commit messages, no force pushes to main

### Five Mandatory Methodologies

Every piece of work in this project MUST apply these five methodologies. They are not optional.

1. **Automated Git Workflow** — Changes auto-committed and auto-pushed on passing tests
2. **Self-Healing Prompts** — Failures auto-diagnosed, auto-fixed, and escalated if unresolvable
3. **Triangulation** — Every approach validated from 3 independent sources before coding begins
4. **Cross-Validation** — Systematic validation of ALL results (code, data, ML, optimization, UI)
5. **Reference Fetching** — Consult Kaggle, GitHub, academic books, journal articles, and theses before implementation

See detailed protocols below in [Mandatory Methodologies](#mandatory-methodologies-protocols).

---

## Mandatory Methodologies (Protocols)

### 1. Automated Git Workflow Protocol

**Principle**: No manual git operations. All changes are committed and pushed automatically when quality gates pass.

**Workflow**:

```
Code Change
    │
    ▼
Pre-commit Hooks (automatic)
    ├── Python: ruff lint + black format + type check (mypy)
    ├── TypeScript: eslint + prettier + tsc --noEmit
    ├── Secrets scan: detect-secrets (block commits with API keys)
    └── Test: pytest (unit) + vitest (unit)
    │
    ▼ (all pass?)
Auto-Commit (conventional commit message)
    │
    ▼
Pre-push Hooks (automatic)
    ├── Full test suite: pytest --cov + npm run test:coverage
    ├── Coverage gate: ≥80% on changed files
    └── Build check: npm run build (no errors)
    │
    ▼ (all pass?)
Auto-Push to feature branch
    │
    ▼
CI/CD Pipeline (GitHub Actions)
    ├── Lint + type-check + test (matrix: Python 3.11 + Node 20)
    ├── Coverage report → PR comment
    ├── Security audit (npm audit + pip-audit)
    ├── E2E tests (Playwright) against preview deployment
    └── Auto-deploy on main merge (Vercel + Railway)
```

**Implementation — Pre-commit config** (`.pre-commit-config.yaml`):

```yaml
repos:
  - repo: local
    hooks:
      - id: ruff-lint
        name: Ruff Lint
        entry: ruff check --fix
        language: system
        types: [python]
      - id: black-format
        name: Black Format
        entry: black
        language: system
        types: [python]
      - id: mypy-check
        name: Mypy Type Check
        entry: mypy --ignore-missing-imports
        language: system
        types: [python]
        pass_filenames: false
      - id: eslint
        name: ESLint
        entry: bash -c 'cd frontend && npx eslint'
        language: system
        files: '\.(ts|tsx)$'
      - id: prettier
        name: Prettier
        entry: bash -c 'cd frontend && npx prettier --write'
        language: system
        files: '\.(ts|tsx|css|json)$'
      - id: detect-secrets
        name: Detect Secrets
        entry: detect-secrets-hook
        language: system
      - id: pytest-unit
        name: Pytest Unit
        entry: pytest tests/unit/ -x -q
        language: system
        pass_filenames: false
      - id: vitest-unit
        name: Vitest Unit
        entry: bash -c 'cd frontend && npx vitest run'
        language: system
        pass_filenames: false
```

**Auto-commit script** (`scripts/auto_commit.sh`):

```bash
#!/bin/bash
# Auto-commit and push when all quality gates pass
# Called by Claude Code after completing a task

set -e

# 1. Stage changes
git add -A

# 2. Run pre-commit hooks
pre-commit run --all-files || { echo "QUALITY GATE FAILED — fix issues first"; exit 1; }

# 3. Generate commit message from staged diff
COMMIT_MSG=$(git diff --cached --stat | head -5)

# 4. Commit
git commit -m "feat: auto-commit — ${COMMIT_MSG}

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

# 5. Push to current branch
git push origin HEAD
```

**Rules**:
- NEVER commit directly to `main` — always use feature branches
- Pre-commit hooks MUST pass before any commit is created
- Coverage MUST be ≥80% on changed files before push
- CI MUST be green before merge to main
- Auto-deploy triggers on main merge only

---

### 2. Self-Healing Prompt Protocol

**Principle**: When code fails (tests, builds, runtime), automatically diagnose the root cause, apply a fix, and re-validate. Escalate to the user only after 3 failed attempts.

**Workflow**:

```
Error Detected
    │
    ▼
┌─────────────────────────────────┐
│  STEP 1: DIAGNOSE               │
│  - Read full error traceback     │
│  - Identify error category:      │
│    ├── Import error              │
│    ├── Type error                │
│    ├── Test failure              │
│    ├── Build failure             │
│    ├── Runtime exception         │
│    ├── API contract mismatch     │
│    └── Environment issue         │
│  - Search codebase for context   │
│  - Check recent changes (git     │
│    diff) for regression          │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  STEP 2: FIX (Attempt 1)        │
│  - Apply targeted fix            │
│  - Run affected tests            │
│  - If PASS → commit + continue   │
│  - If FAIL → go to Step 3        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  STEP 3: ALTERNATIVE FIX (Att 2)│
│  - Try different approach         │
│  - Consult reference sources     │
│    (Kaggle, GitHub, docs)        │
│  - Run tests again               │
│  - If PASS → commit + continue   │
│  - If FAIL → go to Step 4        │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  STEP 4: DEEP ANALYSIS (Att 3)  │
│  - Re-read all related files     │
│  - Check dependency versions     │
│  - Review architecture docs      │
│  - Apply comprehensive fix       │
│  - If PASS → commit + continue   │
│  - If FAIL → ESCALATE to user    │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  STEP 5: ESCALATE               │
│  - Present to user:              │
│    1. What failed                │
│    2. What was tried (3 attempts)│
│    3. Root cause hypothesis      │
│    4. Proposed options            │
│  - Wait for user decision        │
└─────────────────────────────────┘
```

**Self-healing rules**:
- ALWAYS read the full error message before attempting a fix
- ALWAYS run the failing test after each fix attempt to verify
- NEVER apply the same fix twice — each attempt must be a different approach
- NEVER suppress errors with try/except without understanding the cause
- Log every diagnosis and fix attempt for traceability
- After a successful self-heal, add a regression test to prevent recurrence

**Error category playbook**:

| Error Category | Diagnosis Action | Fix Strategy |
|---|---|---|
| Import error | Check installed packages, Python version | Install missing dep, fix import path |
| Type error (Python) | Read mypy output, check function signatures | Add/fix type annotations, cast correctly |
| Type error (TS) | Read tsc output, check interface definitions | Regenerate types from OpenAPI, fix interface |
| Test assertion failure | Compare expected vs actual, check test data | Fix logic bug, update test if spec changed |
| Build failure (Next.js) | Read build log, check for SSR issues | Fix client/server component boundary |
| API 500 error | Read FastAPI traceback, check request payload | Fix endpoint logic, validate input |
| API contract mismatch | Compare Pydantic schema vs TS interface | Regenerate TS types, align schemas |
| CORS error | Check origin, method, headers config | Update `cors_origins` in Settings |
| Redis connection | Check URL, container status | Start Redis, fix connection string |
| TensorFlow error | Check Python version, GPU config | Ensure Python 3.11, set memory limits |

---

### 3. Triangulation Protocol

**Principle**: Before writing ANY implementation code, validate the approach from **3 independent sources** to ensure consistency, relevance, and correctness. This is a mandatory gate — no code is written until triangulation passes.

**The Three Vertices**:

```
                    ▲ VERTEX 1
                   ╱ ╲  Academic Literature
                  ╱   ╲ (Books, Papers, Theses)
                 ╱     ╲
                ╱       ╲
               ╱ APPROACH ╲
              ╱  VALIDATED  ╲
             ╱   (3/3 agree) ╲
            ╱                 ╲
VERTEX 2   ▼───────────────────▼  VERTEX 3
Industry Best Practice        Internal Consistency
(GitHub, Kaggle, Docs)        (Codebase, Architecture)
```

**Vertex 1 — Academic Literature** (Books, Papers, Theses):
- Search for peer-reviewed papers or established textbooks covering the technique
- Verify the approach is theoretically sound for the problem domain
- Check if the method has known limitations for this use case
- Sources: Google Scholar, arXiv, IEEE, ACM, Springer, textbooks

**Vertex 2 — Industry Best Practice** (GitHub, Kaggle, Documentation):
- Search public GitHub repositories for production implementations
- Search Kaggle notebooks/competitions for applied examples
- Check official documentation and changelogs
- Sources: GitHub, Kaggle, Stack Overflow, official docs

**Vertex 3 — Internal Consistency** (Codebase + Architecture):
- Verify the approach is consistent with existing patterns in `app_core/`
- Check it doesn't violate architectural decisions in this CLAUDE.md
- Ensure it integrates with the existing service layer and API contracts
- Check no circular dependencies or coupling violations

**Triangulation workflow**:

```
BEFORE writing code for any task:

1. STATE the approach you plan to take (1-2 sentences)

2. VERTEX 1 — Academic validation:
   - Fetch and cite at least 1 relevant source (book, paper, or thesis)
   - Confirm theoretical soundness
   - Note any caveats or limitations
   - Record: "Academic source: [Author, Year] — [finding]"

3. VERTEX 2 — Industry validation:
   - Fetch and reference at least 1 GitHub repo or Kaggle notebook
   - Confirm the pattern is used in production/competition settings
   - Note any adaptations needed for this project
   - Record: "Industry source: [repo/notebook URL] — [pattern observed]"

4. VERTEX 3 — Internal validation:
   - Read relevant existing code in the project
   - Confirm no conflicts with CLAUDE.md rules or architecture
   - Confirm integration path with existing services
   - Record: "Internal check: [file:line] — [consistency confirmed/conflict found]"

5. VERDICT:
   - 3/3 agree → PROCEED with implementation
   - 2/3 agree → PROCEED with documented caveat
   - 1/3 or 0/3 agree → STOP, reconsider approach, re-triangulate
```

**Triangulation documentation template** (add as code comment or ADR):

```python
# === TRIANGULATION RECORD ===
# Task: [description]
# Approach: [chosen approach]
#
# Vertex 1 (Academic):
#   Source: [Author (Year). "Title". Journal/Book. DOI/ISBN]
#   Finding: [what the source says about this approach]
#   Relevance: [how it applies to our case]
#
# Vertex 2 (Industry):
#   Source: [GitHub repo URL or Kaggle notebook URL]
#   Pattern: [what pattern they use and why]
#   Adaptation: [how we adapted it for HealthForecast AI]
#
# Vertex 3 (Internal):
#   Files checked: [file:line references]
#   Consistency: [confirmed/conflict — details]
#
# Verdict: PROCEED / PROCEED WITH CAVEAT / REJECTED
# =============================
```

**Triangulation is REQUIRED for**:
- Any new ML model or algorithm implementation
- Any new API endpoint design
- Any state management pattern
- Any database schema change
- Any authentication/security decision
- Any deployment infrastructure choice
- Any third-party library selection
- Any deviation from existing patterns

---

### 4. Cross-Validation Protocol

**Principle**: Every result — code, data, model, optimization, UI — must be validated through multiple independent checks. Never trust a single test or metric.

**4.1 Code Cross-Validation**:

```
Every code change must pass ALL of:
├── Static analysis: ruff + mypy (Python) / eslint + tsc (TypeScript)
├── Unit tests: isolated component/function tests
├── Integration tests: multi-component workflow tests
├── Contract tests: API request/response schema validation
├── Snapshot tests: UI component render consistency (Vitest)
└── Build verification: production build succeeds (npm run build)
```

**4.2 Data Cross-Validation**:

```
Every data pipeline step must verify:
├── Schema validation: column names, types, ranges (Pydantic / Zod)
├── Statistical checks: row count, null %, distribution shape
├── Temporal consistency: no future data leaking into training set
├── Referential integrity: all foreign keys resolve
├── Idempotency: running the pipeline twice produces identical output
└── Boundary checks: min/max values within clinical plausibility
```

**4.3 ML Model Cross-Validation**:

```
Every trained model must be validated by:
├── K-Fold temporal cross-validation (TimeSeriesSplit, k=5)
│   ├── Expanding window: train on [0..t], test on [t+1..t+h]
│   └── Report mean ± std for each metric across folds
├── Multiple metrics (never rely on a single metric):
│   ├── RMSE — scale-dependent error magnitude
│   ├── MAE — robust to outliers
│   ├── MAPE — percentage error (interpretable)
│   ├── R² — variance explained
│   └── Coverage — prediction interval calibration (conformal)
├── Residual diagnostics:
│   ├── Normality test (Shapiro-Wilk or Jarque-Bera)
│   ├── Autocorrelation test (Ljung-Box)
│   ├── Heteroscedasticity check (visual + Breusch-Pagan)
│   └── No remaining signal in residuals
├── Comparison against baselines:
│   ├── Naive forecast (last value repeated)
│   ├── Seasonal naive (same day last week)
│   └── Historical mean
├── Stability check:
│   ├── Train with 3 different seeds → metrics within ±5%
│   └── Train on 80% vs 90% data → consistent ranking
└── Out-of-sample holdout:
    └── Final test set NEVER used during development (only for thesis reporting)
```

**4.4 Optimization Cross-Validation**:

```
Every MILP solution must verify:
├── Feasibility: all constraints satisfied (PuLP status == "Optimal")
├── Sensitivity analysis: vary key parameters ±10%, check solution stability
├── Bound verification: objective value between relaxed LP and naive heuristic
├── Constraint audit: manually verify 3 random time periods satisfy all constraints
├── Alternative solver: solve with CBC and GLPK, compare objective values
└── Business sense check: does the schedule/order plan look reasonable to a human?
```

**4.5 UI Cross-Validation**:

```
Every frontend page must verify:
├── Component tests: renders correctly with mock data (Vitest)
├── API integration: correct data flow from backend (MSW mock)
├── Visual regression: screenshot comparison (Playwright)
├── Accessibility: axe-core audit passes (no critical/serious violations)
├── Responsive: renders on 1024px, 1440px, 1920px widths
├── Error states: displays correctly when API returns 4xx/5xx
├── Loading states: shows skeleton/spinner during fetch
└── Empty states: handles zero-data gracefully
```

**Cross-validation reporting template**:

```markdown
## Cross-Validation Report — [Component/Model Name]

### Summary
- Component: [name]
- Date: [YYYY-MM-DD]
- Status: PASS / FAIL / PARTIAL

### Results
| Validation Layer | Status | Details |
|---|---|---|
| Static analysis | ✅/❌ | [details] |
| Unit tests | ✅/❌ | [X/Y passed, coverage %] |
| Integration tests | ✅/❌ | [details] |
| [ML/Optimization specific checks] | ✅/❌ | [details] |

### Issues Found
- [issue 1 — how resolved]
- [issue 2 — how resolved]

### Conclusion
[1-2 sentences on overall quality assessment]
```

---

### 5. Reference Fetching Protocol

**Principle**: Before implementing any significant feature, consult external references to ensure best practices are followed. This applies to ML workflows, data engineering, frontend patterns, and infrastructure.

**Reference sources (ranked by priority)**:

#### 5.1 Academic Sources (Books, Papers, Theses)

**Mandatory references for this project's domain**:

| Topic | Key References |
|---|---|
| **Time Series Forecasting** | Hyndman & Athanasopoulos (2021). *Forecasting: Principles and Practice*, 3rd ed. OTexts. (Free: otexts.com/fpp3) |
| **ARIMA/SARIMAX** | Box, Jenkins, Reinsel & Ljung (2015). *Time Series Analysis: Forecasting and Control*, 5th ed. Wiley. |
| **LSTM for Time Series** | Brownlee, J. (2018). *Deep Learning for Time Series Forecasting*. Machine Learning Mastery. |
| **XGBoost** | Chen & Guestrin (2016). "XGBoost: A Scalable Tree Boosting System". *KDD '16*. doi:10.1145/2939672.2939785 |
| **Hybrid Models** | Zhang, G.P. (2003). "Time series forecasting using a hybrid ARIMA and neural network model". *Neurocomputing*, 50, 159-175. |
| **Conformal Prediction** | Vovk, Gammerman & Shafer (2005). *Algorithmic Learning in a Random World*. Springer. |
| **Operations Research** | Hillier & Lieberman (2021). *Introduction to Operations Research*, 11th ed. McGraw-Hill. |
| **MILP Staff Scheduling** | Ernst et al. (2004). "Staff scheduling and rostering: A review of applications, methods and models". *EJOR*, 153(1), 3-27. |
| **Healthcare Forecasting** | Kadri et al. (2014). "Time series modelling and forecasting of emergency department overcrowding". *J Med Syst*, 38, 107. |
| **ED Demand Prediction** | Marcilio et al. (2013). "Forecasting daily emergency department visits using calendar variables and ambient temperature readings". *Acad Emerg Med*, 20(8), 769-777. |
| **Seasonal Decomposition** | Cleveland et al. (1990). "STL: A Seasonal-Trend Decomposition Procedure Based on Loess". *J Official Stats*, 6(1), 3-73. |
| **Software Engineering** | Martin, R.C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. |
| **ML Engineering** | Burkov, A. (2020). *Machine Learning Engineering*. True Positive Inc. |
| **ML System Design** | Huyen, C. (2022). *Designing Machine Learning Systems*. O'Reilly. |
| **Statistical Learning** | Hastie, Tibshirani & Friedman (2009). *The Elements of Statistical Learning*, 2nd ed. Springer. (Free: hastie.su.domains/ElemStatLearn) |
| **Deep Learning** | Goodfellow, Bengio & Courville (2016). *Deep Learning*. MIT Press. (Free: deeplearningbook.org) |
| **Feature Engineering** | Zheng & Casari (2018). *Feature Engineering for Machine Learning*. O'Reilly. |
| **Full-Stack Development** | Next.js Documentation — nextjs.org/docs (official, always current) |
| **API Design** | Masse, M. (2011). *REST API Design Rulebook*. O'Reilly. |

**How to search for additional references**:
```
Search strategy for any new technique:
1. Google Scholar: "[technique name] [domain]" (e.g., "LSTM emergency department forecasting")
2. arXiv: cs.LG or stat.ML categories
3. IEEE Xplore / ACM Digital Library: conference papers
4. Springer / Elsevier: journal articles
5. University thesis repositories: ProQuest, EThOS, HAL
6. Filter: prefer papers cited ≥50 times, published within last 10 years
```

#### 5.2 Industry Sources (GitHub + Kaggle)

**How to fetch GitHub references**:
```
Search pattern:
1. GitHub Search: "[technique] [framework] [language]"
   Examples:
   - "time series forecasting fastapi python"
   - "LSTM patient arrivals hospital"
   - "nextjs dashboard recharts tailwind"
   - "celery background task training ml"
   - "MILP staff scheduling pulp"

2. Filter criteria:
   - Stars ≥ 50 (quality signal)
   - Updated within last 2 years (not abandoned)
   - Has tests (quality signal)
   - Has LICENSE file (legal use)

3. What to extract:
   - Project structure and architecture patterns
   - Testing strategies
   - Error handling patterns
   - API design patterns
   - Deployment configurations
```

**How to fetch Kaggle references**:
```
Search pattern:
1. Kaggle Notebooks: "[technique] [domain]"
   Examples:
   - "emergency department forecasting"
   - "hospital demand prediction LSTM"
   - "time series hybrid model"
   - "XGBoost forecasting feature engineering"
   - "conformal prediction intervals"

2. Kaggle Competitions:
   - "Tabular Playground Series" (time series tasks)
   - "Store Sales - Time Series Forecasting"
   - "Web Traffic Time Series Forecasting"
   - "M5 Forecasting" (hierarchical time series)

3. Filter criteria:
   - Upvotes ≥ 20 (community validated)
   - Medal-winning notebooks preferred
   - Competition top-10% solutions preferred

4. What to extract:
   - Feature engineering techniques
   - Model ensembling strategies
   - Evaluation methodologies
   - Data preprocessing patterns
   - Hyperparameter ranges and tuning strategies
```

#### 5.3 Official Documentation Sources

| Technology | Documentation URL | What to Check |
|---|---|---|
| Next.js | nextjs.org/docs | App Router patterns, middleware, SSR |
| React | react.dev | Hooks, Server Components, best practices |
| Tailwind CSS | tailwindcss.com/docs | Utility classes, dark mode, customization |
| FastAPI | fastapi.tiangolo.com | Dependencies, WebSocket, background tasks |
| TanStack Query | tanstack.com/query | Queries, mutations, caching strategies |
| Zustand | docs.pmnd.rs/zustand | Store patterns, middleware, persistence |
| Celery | docs.celeryq.dev | Task routing, error handling, monitoring |
| PuLP | coin-or.github.io/pulp | MILP modelling, solver options |
| TensorFlow | tensorflow.org/api_docs | Keras layers, callbacks, saving models |
| XGBoost | xgboost.readthedocs.io | Parameters, early stopping, feature importance |
| Optuna | optuna.readthedocs.io | Study, samplers, pruners |
| statsmodels | statsmodels.org | ARIMA, SARIMAX, diagnostics |
| Supabase | supabase.com/docs | Auth, RLS, Storage, Edge Functions |
| Playwright | playwright.dev/docs | Test patterns, selectors, assertions |
| Vitest | vitest.dev/guide | Configuration, mocking, coverage |

#### 5.4 Reference Fetching Workflow

```
BEFORE implementing any feature:

1. IDENTIFY the core technique(s) involved
   Example: "Implementing LSTM+XGBoost hybrid for ED forecasting"

2. FETCH ACADEMIC REFERENCE (Vertex 1 of Triangulation):
   - Search Google Scholar / textbook index for the technique
   - Read abstract + methodology section
   - Record citation in triangulation comment
   - Use WebSearch or WebFetch tools to access sources

3. FETCH INDUSTRY REFERENCE (Vertex 2 of Triangulation):
   - Search GitHub for production implementations
     → Use WebSearch: "site:github.com [technique] [stack]"
   - Search Kaggle for applied notebooks
     → Use WebSearch: "site:kaggle.com [technique] [domain]"
   - Record URL and key pattern observed

4. CHECK OFFICIAL DOCS:
   - Read relevant section of framework docs
   - Verify API usage is current (not deprecated)
   - Record any version-specific notes

5. SYNTHESIZE:
   - Do all sources agree on the approach? → Proceed
   - Sources conflict? → Document the conflict and choose with rationale
   - No sources found? → This is a novel approach — document extra carefully
```

**Reference fetching is REQUIRED for**:
- Any ML model implementation or modification
- Any new data processing pipeline step
- Any API architecture decision
- Any frontend state management pattern
- Any database schema design
- Any deployment or infrastructure choice
- Any third-party library selection
- Any statistical test or validation methodology

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
