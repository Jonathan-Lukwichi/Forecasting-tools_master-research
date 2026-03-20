# PLAN.md — HealthForecast AI Issue Resolution Master Plan

> **Status**: READY FOR EXECUTION
> **Created**: 2026-03-20
> **Audit Result**: 98 issues (20 CRITICAL, 30 HIGH, 32 MEDIUM, 16 LOW)
> **Work Streams**: 4 parallel tracks, 25 atomic commits

---

## System Prompt — Trigger Implementation

Copy-paste the block below into a new Claude Code conversation to trigger execution of this plan.

```
You are an expert software engineer executing a pre-approved fix plan for the HealthForecast AI thesis project.

## YOUR MISSION
Execute the plan defined in PLAN.md (this repository root). The plan contains 25 atomic commits across 4 work streams (D, A, C, B) that fix 98 identified issues. You MUST follow every instruction exactly.

## EXECUTION RULES

1. **Read PLAN.md and CLAUDE.md first** — Understand the full plan and all project constraints before writing any code.

2. **Work stream order is mandatory**:
   - Phase 1: D1→D5 (Infrastructure) — can be parallel
   - Phase 2: A1→A3, A6 (Security basics) — can be parallel
   - Phase 3: A4 → A5 → A7 (Auth chain) — MUST be sequential
   - Phase 4: C2→C6 (Frontend fixes) — can be parallel
   - Phase 5: C1 (TanStack Query) — after A7
   - Phase 6: B5→B8 (ML low-risk) — can be parallel
   - Phase 7: B1, B2, B4 (ML medium-risk) — can be parallel
   - Phase 8: B3 → B9 (ML high-risk) — sequential, do last
   - Phase 9: D6 (CI thresholds) — only after all tests pass

3. **Feature branches** — Create one branch per work stream:
   - `fix/infrastructure-deps`
   - `fix/security-hardening`
   - `fix/frontend-architecture`
   - `fix/ml-reproducibility`

4. **Conventional commits** — Every commit uses the prefix specified in the plan (fix:, chore:, feat:, refactor:, test:).

5. **Tests are mandatory** — Every commit MUST include the tests specified in the plan. Run tests after each commit. If tests fail, trigger the Self-Healing Protocol (see PLAN.md §Self-Healing Protocol).

6. **Self-Healing Protocol** — When ANY error occurs (test failure, build failure, lint error, runtime exception):
   - ATTEMPT 1: Read the full error. Diagnose root cause. Apply targeted fix. Re-run tests.
   - ATTEMPT 2: If still failing, try a different approach. Consult CLAUDE.md references. Re-run tests.
   - ATTEMPT 3: If still failing, re-read all related files. Check dependency versions. Apply comprehensive fix. Re-run tests.
   - ESCALATE: If 3 attempts fail, STOP. Report: (1) what failed, (2) what was tried, (3) root cause hypothesis, (4) proposed options. Wait for user decision.

7. **Cross-Validation** — After each work stream completes:
   - Backend: `pytest tests/ -v --cov=api --cov=app_core --cov-report=term-missing`
   - Frontend: `cd frontend && npm run lint && npm run type-check && npx vitest run`
   - Build: `cd frontend && npm run build`
   - If any check fails, do NOT proceed to the next work stream. Fix first.

8. **Skills to use**:
   - Use Grep/Glob for codebase search before modifying any file
   - Use Read to verify current file state before editing
   - Use Agent (Explore) when you need to understand patterns across multiple files
   - Use Bash for running tests, checking versions, git operations
   - Use Edit for targeted changes (prefer over Write for existing files)
   - Use Write only for new files

9. **After ALL work streams complete**:
   - Run full test suite (backend + frontend)
   - Verify no regressions
   - Update PLAN.md status to COMPLETED with results summary

START by reading PLAN.md and CLAUDE.md, then execute Phase 1 (D1-D5).
```

---

## Self-Healing Protocol

This protocol is triggered automatically whenever a fix causes a test failure, build error, lint violation, or runtime exception. It follows CLAUDE.md Methodology #2.

### Protocol Flow

```
ERROR DETECTED
    │
    ▼
┌─────────────────────────────────────────────────┐
│  STEP 0: CAPTURE CONTEXT                         │
│  - Save the full error message/traceback         │
│  - Note which commit/fix triggered the error     │
│  - Note which test(s) are failing                │
│  - Record timestamp for traceability             │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 1: DIAGNOSE (Read before acting)           │
│                                                   │
│  Classify the error:                              │
│  ├── IMPORT_ERROR     → Check deps, Python path  │
│  ├── TYPE_ERROR       → Check signatures, types  │
│  ├── TEST_ASSERTION   → Compare expected/actual   │
│  ├── BUILD_FAILURE    → Check SSR, client/server  │
│  ├── LINT_VIOLATION   → Run ruff/eslint --fix     │
│  ├── RUNTIME_ERROR    → Read traceback fully      │
│  ├── API_MISMATCH     → Compare Pydantic ↔ TS    │
│  ├── CIRCULAR_IMPORT  → Check import graph        │
│  └── ENV_ISSUE        → Check .env, versions      │
│                                                   │
│  Actions:                                         │
│  1. Read the FULL error output (not just last ln) │
│  2. Read the file(s) mentioned in traceback       │
│  3. Check git diff for recent changes             │
│  4. Identify if this is a regression or new issue │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 2: FIX — Attempt 1 (Targeted Fix)         │
│                                                   │
│  - Apply the most obvious fix based on diagnosis │
│  - Change ONLY the minimum needed                │
│  - Run the specific failing test:                │
│    pytest tests/path/to/test.py::test_name -xvs  │
│  - If PASS → commit + continue plan              │
│  - If FAIL → go to Attempt 2                     │
│                                                   │
│  LOG: "Self-heal attempt 1: [description]"       │
└──────────────────────┬──────────────────────────┘
                       │ (still failing)
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 3: FIX — Attempt 2 (Alternative Approach) │
│                                                   │
│  - Try a DIFFERENT approach (never repeat #1)    │
│  - Consult CLAUDE.md reference sources:          │
│    ├── Official docs (FastAPI, Next.js, etc.)    │
│    ├── Existing patterns in codebase             │
│    └── Error category playbook (CLAUDE.md §2)    │
│  - Search codebase for similar solved problems   │
│  - Run the failing test again                    │
│  - If PASS → commit + continue plan              │
│  - If FAIL → go to Attempt 3                     │
│                                                   │
│  LOG: "Self-heal attempt 2: [description]"       │
└──────────────────────┬──────────────────────────┘
                       │ (still failing)
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 4: FIX — Attempt 3 (Deep Analysis)        │
│                                                   │
│  - Re-read ALL related files (imports, deps)     │
│  - Check dependency versions match requirements  │
│  - Review CLAUDE.md architecture rules            │
│  - Consider if the plan step needs modification  │
│  - Apply comprehensive fix                       │
│  - Run FULL test suite (not just failing test)   │
│  - If PASS → commit + continue plan              │
│  - If FAIL → ESCALATE                            │
│                                                   │
│  LOG: "Self-heal attempt 3: [description]"       │
└──────────────────────┬──────────────────────────┘
                       │ (still failing)
                       ▼
┌─────────────────────────────────────────────────┐
│  STEP 5: ESCALATE TO USER                        │
│                                                   │
│  Present clearly:                                 │
│  1. WHAT failed (exact error + test name)        │
│  2. WHAT was tried (all 3 attempts summarized)   │
│  3. WHY it's failing (root cause hypothesis)     │
│  4. OPTIONS to proceed:                          │
│     a) Skip this fix and continue plan           │
│     b) Modify the plan step approach             │
│     c) User provides guidance                    │
│                                                   │
│  WAIT for user decision before continuing.       │
└─────────────────────────────────────────────────┘
```

### Self-Healing Rules

1. **ALWAYS read the full error** before attempting any fix
2. **ALWAYS run the failing test** after each attempt to verify
3. **NEVER apply the same fix twice** — each attempt must be different
4. **NEVER suppress errors** with try/except without understanding cause
5. **NEVER skip a test** — if a test fails, fix the code, not the test (unless the test itself is wrong)
6. **LOG every attempt** — append to the commit message what was tried
7. **After successful self-heal** — consider adding a regression test

### Error Category Quick Reference

| Error | Diagnosis | Fix Strategy |
|-------|-----------|-------------|
| `ImportError` | Check `requirements*.txt`, virtualenv | Install dep, fix path |
| `TypeError` (Python) | Read function signature, check types | Fix annotation, add cast |
| `TypeError` (TS) | Read interface, check props | Fix interface, add guard |
| `AssertionError` (test) | Compare expected vs actual | Fix logic or update test |
| `Build error` (Next.js) | Check SSR/client boundary | Add "use client", fix imports |
| `CORS error` | Check allowed origins/methods | Update cors_origins in config |
| `422 Validation` | Check Pydantic schema | Align request body with schema |
| `500 Server Error` | Read FastAPI traceback | Fix endpoint logic |
| `Hydration mismatch` | Check SSR vs client state | Guard localStorage access |
| `Memory leak` (React) | Check useEffect cleanup | Add AbortController/clearTimeout |

---

## Skills Reference — Efficient Implementation

These are the specific Claude Code skills and tool patterns to use for each type of task in this plan.

### Skill 1: Safe File Editing Pattern

```
BEFORE editing any file:
1. Read the file first (Read tool) — understand current state
2. Search for related patterns (Grep tool) — ensure consistency
3. Edit with minimal changes (Edit tool) — surgical precision
4. Verify the edit didn't break anything (Bash: run tests)

NEVER use Write tool on existing files unless doing a complete rewrite.
ALWAYS use Edit tool for targeted changes — it shows the diff clearly.
```

### Skill 2: Test-Driven Fix Pattern

```
For EVERY fix in this plan:
1. Write the test FIRST (Write tool — new test file)
2. Run the test — confirm it FAILS (proves the bug exists)
3. Apply the fix (Edit tool)
4. Run the test — confirm it PASSES
5. Run the full suite — confirm no regressions
6. Commit with conventional message
```

### Skill 3: Branch Management

```
For each work stream:
1. git checkout main && git pull
2. git checkout -b fix/[work-stream-name]
3. Make all commits for that work stream
4. Run full verification (backend + frontend + build)
5. Report results to user
```

### Skill 4: Dependency Version Discovery

```
To find the exact installed version of a package:
- Python: pip show [package] | grep Version
- Node: npm list [package] | head -3
- Use these exact versions when pinning in requirements files
```

### Skill 5: Parallel Exploration

```
When multiple files need investigation:
- Launch Explore agents in parallel (up to 3)
- One agent per area (backend, frontend, ML)
- Synthesize findings before making changes
- This saves time on large codebases
```

### Skill 6: ML Determinism Verification

```
To verify ML reproducibility after seed fixes:
1. Create a small test dataset (use conftest.py fixtures)
2. Train model with seed=42, save metrics
3. Train model again with seed=42, save metrics
4. Assert metrics are identical (within 1e-6 tolerance)
5. This is MANDATORY for commits B1, B2, B7
```

### Skill 7: Security Verification

```
After auth changes (A4, A5, A7):
1. Start the API: uvicorn api.main:app --port 8000
2. Test without token: curl http://localhost:8000/api/auth/me → 401
3. Test with bad token: curl -H "Authorization: Bearer fake" → 401
4. Test login → get cookie → test with cookie → 200
5. Test WebSocket without token → connection rejected
```

### Skill 8: Cross-Validation Checklist

```
After EACH work stream is complete, run ALL of these:

Backend:
  pytest tests/ -v --cov=api --cov=app_core --cov-report=term-missing

Frontend:
  cd frontend && npm run lint
  cd frontend && npm run type-check
  cd frontend && npx vitest run --coverage

Build:
  cd frontend && npm run build

Linting:
  ruff check api/ app_core/ tests/
  ruff format --check api/ app_core/ tests/

ALL must pass before moving to next work stream.
```

---

## Full Plan — 25 Commits Across 4 Work Streams

### WORK STREAM D: Infrastructure & Dependencies (Phase 0)

**Branch**: `fix/infrastructure-deps`
**Depends on**: Nothing — start here

#### D1: `chore: pin all dependency versions for reproducibility`
- **Files**: `requirements.txt`, `requirements-deploy.txt`
- **Action**: Replace ALL `>=` with `==` (match installed versions from virtualenv). Remove unused `prophet` (never imported) and `lime` (legacy Streamlit only). Use `requirements-api.txt` as the pinning standard.
- **Test**: `tests/unit/test_requirements.py` — parse all req files, assert no `>=`/`^`/`~` specifiers
- **Risk**: LOW
- **Verification**: `pip install -r requirements.txt -r requirements-api.txt` succeeds. `pytest tests/` still passes.
- **CLAUDE.md Rule**: #13 (ALWAYS pin dependency versions)

#### D2: `fix: create missing optimization_tasks.py worker module`
- **Files**: Create `api/workers/optimization_tasks.py`
- **Action**: Stub Celery tasks `optimize_staff` and `optimize_inventory` following the pattern in `api/workers/training_tasks.py`. Import from `app_core/optimization/milp_solver.py`. Use `self.update_state()` for progress. Handle errors with structured error dict.
- **Test**: `tests/api/test_optimization_tasks.py` — verify module imports, tasks are discoverable by Celery, stubs return expected structure
- **Risk**: MEDIUM
- **CLAUDE.md Rule**: #5 (Background jobs for anything > 5 seconds)

#### D3: `fix: add Pydantic schemas for job submission requests`
- **Files**: `api/schemas/ml.py`, `api/routes/jobs.py:74-92`
- **Action**: Create `TrainJobRequest(BaseModel)` with fields: `dataset_id: str`, `model_type: str`, `horizons: list[int] = [1,2,3,4,5,6,7]`, `hyperparameters: dict[str,Any] = {}`, `auto_tune: bool = False`, `n_trials: int = 50`. Replace `body: dict[str, Any]` in routes.
- **Test**: `tests/api/test_job_schemas.py` — missing `dataset_id` returns 422, valid body passes
- **Risk**: LOW-MEDIUM
- **CLAUDE.md Rule**: #4 (Pydantic for all API contracts)

#### D4: `fix: correct forecast endpoint returning RMSE instead of predictions`
- **Files**: `api/routes/forecast.py:37-44`
- **Action**: The current code `model_result.get("metrics", {}).get(f"Target_{h}_rmse", 0)` returns RMSE metric as forecast. Fix: look up `model_result.get("predictions", {})` for actual values. If not available, return HTTP 501 "Model predictions not persisted — retrain required".
- **Test**: `tests/api/test_forecast_routes.py` — mock dataset store with predictions, assert response contains plausible patient counts (integers ~50-500), not floats ~2-8
- **Risk**: HIGH (behavior change — bug fix)
- **CLAUDE.md Rule**: #4 (handle errors gracefully)

#### D5: `chore: add vitest.config.ts for frontend test configuration`
- **Files**: Create `frontend/vitest.config.ts`
- **Action**: Configure: `test.environment: "jsdom"`, `test.include: ["__tests__/**/*.test.{ts,tsx}"]`, path aliases matching `tsconfig.json` (`@/* → ./src/*`), coverage provider `v8`, coverage threshold `{ lines: 80, functions: 80, branches: 80 }`.
- **Risk**: LOW
- **CLAUDE.md Rule**: #11 (NEVER skip tests)

#### D6: `fix: raise CI coverage thresholds to 80%` *(EXECUTE LAST)*
- **Files**: `.github/workflows/ci.yml:105`, `.github/workflows/deploy-api.yml:39`
- **Action**: `--cov-fail-under=60` → `--cov-fail-under=80` in ci.yml. `--cov-fail-under=50` → `--cov-fail-under=80` in deploy-api.yml.
- **When**: ONLY after all other work streams add sufficient tests to bring coverage above 80%
- **Risk**: LOW (config only, but may fail CI if coverage insufficient)
- **CLAUDE.md Rule**: #11 (Minimum 80% coverage)

---

### WORK STREAM A: Security Hardening (Phase 1)

**Branch**: `fix/security-hardening`
**Depends on**: Work Stream D merged

#### A1: `fix: require non-default secret key in production`
- **Files**: `api/config.py:20`
- **Action**: Add Pydantic v2 `@model_validator(mode="after")`:
  ```python
  @model_validator(mode="after")
  def validate_secret_key(self) -> "Settings":
      if not self.debug and self.secret_key == "change-me-in-production":
          raise ValueError(
              "SECRET_KEY must be set to a secure value in production. "
              "Generate one with: openssl rand -hex 32"
          )
      return self
  ```
- **Test**: `tests/api/test_config.py` — `Settings(debug=False, secret_key="change-me-in-production")` raises `ValidationError`. `Settings(debug=True, ...)` passes. Custom key always passes.
- **Risk**: LOW
- **CLAUDE.md Rule**: #2 (NEVER commit secrets)

#### A2: `fix: restrict CORS methods and headers to explicit allowlist`
- **Files**: `api/main.py:35-37`
- **Action**: Replace wildcards:
  ```python
  allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
  ```
- **Test**: `tests/api/test_cors.py` — OPTIONS preflight returns correct headers. TRACE method not allowed.
- **Risk**: MEDIUM (could break if frontend uses unexpected headers)
- **Self-heal if broken**: Check browser DevTools network tab for blocked headers, add to allowlist.

#### A3: `fix: add file upload size and type validation`
- **Files**: `api/routes/data.py:63-80`
- **Action**: Before `_read_upload(file)`:
  ```python
  # Validate extension
  ext = Path(file.filename or "").suffix.lower()
  if ext not in {".csv", ".xlsx", ".xls", ".parquet"}:
      raise HTTPException(400, f"Unsupported file type: {ext}")
  # Validate size
  contents = await file.read()
  if len(contents) > settings.max_upload_size_mb * 1024 * 1024:
      raise HTTPException(413, "File exceeds maximum upload size")
  await file.seek(0)
  # Store ownership
  metadata = {"owner": _user["username"], "dataset_type": dataset_type}
  ```
- **Test**: `tests/api/test_data_upload.py` — large file → 413, `.exe` → 400, valid CSV → 200 with owner in metadata
- **Risk**: LOW
- **CLAUDE.md Rule**: OWASP input validation

#### A4: `fix: add JWT issuer/audience claim validation`
- **Files**: `api/config.py`, `api/dependencies.py:33-65`
- **Action**: Add to Settings: `jwt_issuer: str = "healthforecast-ai"`, `jwt_audience: str = "healthforecast-api"`. In `create_access_token()`: add `"iss"` and `"aud"` to payload. In `decode_token()`: add `issuer=settings.jwt_issuer, audience=settings.jwt_audience` to `jwt.decode()`.
- **Test**: `tests/api/test_auth_security.py` — token with wrong issuer → 401, missing audience → 401, correct claims → pass
- **Risk**: MEDIUM (invalidates existing tokens — users must re-login)

#### A5: `fix: add WebSocket authentication via query token`
- **Files**: `api/routes/jobs.py:428-468`
- **Action**: Before `await websocket.accept()`:
  ```python
  token = websocket.query_params.get("token")
  if not token:
      await websocket.close(code=4001, reason="Missing authentication token")
      return
  try:
      user = decode_token(token)
  except HTTPException:
      await websocket.close(code=4001, reason="Invalid or expired token")
      return
  await websocket.accept()
  ```
- **Test**: `tests/api/test_websocket_auth.py` — no token → 4001, bad token → 4001, valid token → connected
- **Risk**: MEDIUM
- **Depends on**: A4 (tokens must have correct claims)

#### A6: `fix: add thread safety and user isolation to DatasetStore`
- **Files**: `api/services/dataset_store.py`
- **Action**: Add `import threading`. Add `self._lock = threading.RLock()` to `__init__`. Wrap `store()`, `get()`, `delete()`, `list_datasets()` with `with self._lock:`. Add `owner: str` field to `DatasetEntry`. Add `list_datasets_for_user(username: str)` method.
- **Test**: `tests/api/test_dataset_store.py` — concurrent `store()` calls don't corrupt state, user A can't see user B's datasets
- **Risk**: LOW

#### A7: `fix: migrate token storage from localStorage to HTTP-only cookies`
- **Files**: `frontend/src/lib/api.ts`, `api/routes/auth.py`, `api/dependencies.py`, `frontend/src/middleware.ts`
- **Action**:
  - **Backend `auth.py`**: In `login()`, after creating token, set cookie:
    ```python
    response = JSONResponse(content=token_data)
    response.set_cookie(
        key="hf_token", value=access_token,
        httponly=True, secure=True, samesite="lax",
        max_age=settings.access_token_expire_minutes * 60, path="/"
    )
    return response
    ```
    Add `POST /api/auth/logout` that clears cookie.
  - **Backend `dependencies.py`**: In `get_current_user()`, try cookie first, then Authorization header:
    ```python
    from fastapi import Request
    def get_current_user(request: Request, token: str = Depends(oauth2_scheme)):
        cookie_token = request.cookies.get("hf_token")
        actual_token = cookie_token or token
        payload = decode_token(actual_token)
        ...
    ```
  - **Frontend `api.ts`**: Remove `getToken()`/`setToken()`/`removeToken()`. Add `credentials: "include"` to all fetch calls. Remove `Authorization` header injection.
  - **Frontend `middleware.ts`**: Check for `hf_token` cookie presence for route protection.
- **Test**: `tests/api/test_cookie_auth.py` — login sets HttpOnly cookie, authenticated request with cookie succeeds, `document.cookie` doesn't expose token. `frontend/__tests__/unit/lib/api.test.ts` — `apiFetch` uses credentials include.
- **Risk**: HIGH (changes entire auth flow)
- **Depends on**: A4 (correct JWT claims)
- **Self-heal strategy**: If frontend can't authenticate, check `credentials: "include"` is set AND `allow_credentials=True` in CORS. Check `SameSite` attribute.

---

### WORK STREAM C: Frontend Architecture (Phase 1-2)

**Branch**: `fix/frontend-architecture`
**Depends on**: A7 merged (cookie auth stable)

#### C1: `fix: replace raw useEffect+fetch with TanStack Query on dashboard`
- **Files**: `frontend/src/app/(app)/dashboard/page.tsx:101-147`, `frontend/src/app/(app)/layout.tsx`
- **Action**: Add `QueryClientProvider` in app layout. Replace `useEffect` + manual state with:
  ```tsx
  const { data: user, isError: authError } = useQuery({
    queryKey: ["user-me"],
    queryFn: () => api.getMe(),
    retry: false,
  });
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["dashboard-kpis", activeDatasetId],
    queryFn: () => api.getDashboardKPIs(activeDatasetId!),
    enabled: !!activeDatasetId,
  });
  ```
  Redirect on `authError`. Use `isLoading` for skeleton state.
- **Test**: `frontend/__tests__/unit/dashboard/page.test.tsx` — render with loading, success, error states using MSW mocks
- **Risk**: MEDIUM
- **CLAUDE.md Rule**: "TanStack Query for all data fetching (no raw useEffect + fetch)"

#### C2: `fix: clean up setTimeout memory leak in login page`
- **Files**: `frontend/src/app/login/page.tsx:31-38`
- **Action**: Store timer ID and clear on cleanup:
  ```tsx
  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | undefined;
    // ... inside catch:
    timerId = setTimeout(async () => { ... }, 15000);
    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, []);
  ```
- **Test**: `frontend/__tests__/unit/login/page.test.tsx` — unmount clears timer
- **Risk**: LOW

#### C3: `fix: guard Zustand persist against SSR localStorage access`
- **Files**: `frontend/src/stores/pipeline.ts:278-304`
- **Action**: Replace default `localStorage` with SSR-safe adapter:
  ```typescript
  storage: {
    getItem: (name) => (typeof window !== "undefined" ? localStorage.getItem(name) : null),
    setItem: (name, value) => { if (typeof window !== "undefined") localStorage.setItem(name, value); },
    removeItem: (name) => { if (typeof window !== "undefined") localStorage.removeItem(name); },
  },
  ```
- **Test**: `frontend/__tests__/unit/stores/pipeline.test.ts` — store initializes in Node (no window) without error
- **Risk**: LOW

#### C4: `fix: add Error Boundary component for graceful error handling`
- **Files**: Create `frontend/src/components/ErrorBoundary.tsx`, edit `frontend/src/app/(app)/layout.tsx`
- **Action**: React class component with `componentDidCatch` that renders fallback UI with retry button. Wrap `{children}` in layout with `<ErrorBoundary>`.
- **Test**: `frontend/__tests__/unit/components/ErrorBoundary.test.tsx` — child throwing renders fallback, retry resets
- **Risk**: LOW

#### C5: `fix: remove unsafe type casts on API response data`
- **Files**: `frontend/src/app/(app)/dashboard/page.tsx:157-159,233-235`
- **Action**: Replace `(d as { actual?: number }).actual` with type guard:
  ```typescript
  function isForecastPoint(d: unknown): d is { date: string; actual: number } {
    return typeof d === "object" && d !== null && "actual" in d && typeof (d as any).actual === "number";
  }
  const sparklineTrend = (kpis.forecast_trend ?? []).filter(isForecastPoint).map(d => d.actual);
  ```
- **Test**: `frontend/__tests__/unit/dashboard/type-guards.test.ts` — valid/invalid shapes tested
- **Risk**: LOW

#### C6: `fix: add WCAG accessibility attributes to interactive elements`
- **Files**: Login page inputs, dashboard interactive elements, sidebar navigation, Toast close button
- **Action**: Add `aria-label` to icon-only buttons, `aria-live="polite"` to status messages, `role="navigation"` to sidebar, `role="alert"` to error messages, `aria-current="page"` to active nav items.
- **Test**: `frontend/__tests__/unit/accessibility.test.tsx` — run axe-core on rendered components, assert no critical violations
- **Risk**: LOW

---

### WORK STREAM B: ML Reproducibility & Data Integrity (Phase 3)

**Branch**: `fix/ml-reproducibility`
**Depends on**: D1 merged (pinned deps). Independent of A/C.

#### B1: `fix: add seed initialization to LSTM and ANN pipelines`
- **Files**: `app_core/models/ml/lstm_pipeline.py` (train method), `app_core/models/ml/ann_pipeline.py` (train method)
- **Action**: At the start of `train()`, add:
  ```python
  from app_core.models.ml.utils import set_seed
  set_seed(self.config.get("random_state", 42))
  ```
  The `set_seed()` utility already exists and is used by hybrid models (`lstm_xgb.py:65`, `lstm_ann.py:86`). It sets `np.random.seed()`, `random.seed()`, and `tf.random.set_seed()`.
- **Test**: `tests/unit/test_lstm_determinism.py`, `tests/unit/test_ann_determinism.py` — train twice with seed=42 on same data from conftest fixtures, assert metrics identical within `1e-6`
- **Risk**: MEDIUM (model outputs change to become deterministic)
- **CLAUDE.md Rule**: #12 (ALWAYS use deterministic seeds)

#### B2: `fix: add seed to XGBoost random search`
- **Files**: `app_core/models/ml/xgboost_pipeline.py:378-397`
- **Action**: At start of `_random_search()`:
  ```python
  import random
  random.seed(self.config.get("random_state", 42))
  np.random.seed(self.config.get("random_state", 42))
  ```
  For `_bayesian_search()` (currently a stub calling `_random_search()`): raise `NotImplementedError("Bayesian search requires Optuna integration — use random search or grid search")`.
- **Test**: `tests/unit/test_xgboost_determinism.py` — two `_random_search()` runs produce identical parameter sequences
- **Risk**: MEDIUM
- **CLAUDE.md Rule**: #12

#### B3: `fix: prevent LSTM sequence data leakage across split boundaries`
- **Files**: `app_core/models/ml/lstm_pipeline.py:186-204`
- **Action**: Modify `create_sequences()` to accept optional `valid_start` and `valid_end` indices. When provided, only create sequences where the lookback window falls entirely within `[valid_start, valid_end)`. Default behavior (no bounds) preserved for backward compatibility.
  ```python
  def create_sequences(self, X, y, valid_start=None, valid_end=None):
      X_seq, y_seq = [], []
      start = max(self.lookback, valid_start or self.lookback)
      end = valid_end or len(X)
      for i in range(start, end):
          if valid_start is not None and (i - self.lookback) < valid_start:
              continue  # Lookback window extends before valid range
          X_seq.append(X[i - self.lookback:i])
          y_seq.append(y[i])
      return np.array(X_seq), np.array(y_seq)
  ```
  Update all callers to pass split boundaries.
- **Test**: `tests/unit/test_sequence_leakage.py` — split at index 100 with lookback=10. Assert no training sequence has indices >= 100. Assert test sequences don't look back into train indices.
- **Risk**: HIGH (changes training data composition — most impactful fix)
- **CLAUDE.md Rule**: Cross-validation protocol §4.2 (temporal consistency: no future data leaking)

#### B4: `fix: replace silent NaN zero-fill with explicit imputation`
- **Files**: `app_core/models/ml/lstm_pipeline.py`, `app_core/models/ml/ann_pipeline.py`
- **Action**: Replace `np.nan_to_num(X_train, nan=0.0, ...)` with:
  ```python
  import logging
  logger = logging.getLogger(__name__)

  nan_pct = np.isnan(X_train).mean() * 100
  if nan_pct > 10:
      raise ValueError(f"Too many NaN values ({nan_pct:.1f}%) — clean data before training")
  if nan_pct > 0:
      logger.warning("%.1f%% NaN values detected — applying forward-fill + mean imputation", nan_pct)
      # Forward-fill along time axis, then fill remaining with column means
      df_temp = pd.DataFrame(X_train).ffill().fillna(pd.DataFrame(X_train).mean())
      X_train = df_temp.values
  ```
- **Test**: `tests/unit/test_nan_handling.py` — >10% NaN raises `ValueError`, <10% imputes correctly, 0% NaN passes through unchanged
- **Risk**: MEDIUM
- **CLAUDE.md Rule**: Cross-validation protocol §4.2 (statistical checks)

#### B5: `fix: replace bare except clauses with specific exceptions`
- **Files**: `app_core/models/ml/base_ml_pipeline.py:217-220`, `app_core/models/arima_pipeline.py`
- **Action**:
  - `base_ml_pipeline.py`: Replace `except:` with `except (ValueError, RuntimeError, FloatingPointError) as e:` and `logger.warning("R2 calculation failed: %s", e)`.
  - `arima_pipeline.py`: Replace all `except Exception: pass` with `except Exception as e: logger.warning("ARIMA step failed: %s", e)`.
- **Test**: `tests/unit/test_error_handling.py` — verify errors are logged (check log output), not silently swallowed
- **Risk**: LOW
- **CLAUDE.md Rule**: Self-healing §2 (NEVER suppress errors without understanding cause)

#### B6: `fix: stabilize MAPE calculation for zero/near-zero values`
- **Files**: `app_core/models/ml/base_ml_pipeline.py:214`
- **Action**: Replace `np.abs(y_true) + 1e-9` with `np.maximum(np.abs(y_true), 1.0)`:
  ```python
  # Patient counts are non-negative integers; floor denominator at 1.0
  mape = float(np.mean(np.abs((y_true - y_pred) / np.maximum(np.abs(y_true), 1.0))) * 100)
  ```
- **Test**: `tests/unit/test_metrics.py` — MAPE([0,10,20], [1,10,20]) == 33.33 (not infinity), MAPE([100,200], [110,180]) == 10.0
- **Risk**: MEDIUM (changes metric values for any dataset with zero actual values)

#### B7: `fix: reset seed between cross-validation folds`
- **Files**: `app_core/models/ml/base_ml_pipeline.py` (cross_validate method)
- **Action**: At start of each fold loop iteration:
  ```python
  for fold, (train_idx, val_idx) in enumerate(tscv.split(X)):
      set_seed(self.config.get("random_state", 42))  # Reset seed per fold
      ...
  ```
- **Test**: `tests/unit/test_cross_validation.py` — run CV twice with seed=42, assert identical fold metrics
- **Risk**: LOW

#### B8: `fix: make date_col configurable in hybrid models`
- **Files**: `app_core/models/ml/lstm_xgb.py:44`, `app_core/models/ml/lstm_ann.py:69`, `app_core/models/ml/lstm_sarimax.py:51`
- **Action**: Replace `date_col = "Date"` with `date_col = config.get("date_col", "Date")` in all three files.
- **Test**: `tests/unit/test_hybrid_date_col.py` — hybrid model works with `date_col="datetime"`; default `"Date"` still works
- **Risk**: LOW (backward compatible)

#### B9: `fix: warn on small calibration sets in conformal prediction`
- **Files**: `app_core/pipelines/conformal_prediction.py:248`
- **Action**:
  ```python
  import warnings
  if n_cal < 30:
      warnings.warn(
          f"Calibration set has only {n_cal} samples. "
          f"Coverage guarantee of {1-alpha:.0%} may not hold. "
          f"Recommend >=30 calibration samples.",
          UserWarning, stacklevel=2,
      )
  ```
- **Test**: Extend `tests/unit/test_conformal_prediction.py` — `n_cal=5` triggers warning, interval is conservative, coverage still >= `1-alpha`
- **Risk**: MEDIUM

---

## Execution Order Summary

```
┌─────────────────────────────────────────────────────┐
│  PHASE 1: Infrastructure (parallel)                  │
│  D1 ──┬── D2 ──┬── D3 ──┬── D4 ──┬── D5           │
│       │        │        │        │                   │
│       └────────┴────────┴────────┘                   │
│                    │                                  │
│                    ▼                                  │
│  PHASE 2: Security basics (parallel)                 │
│  A1 ──┬── A2 ──┬── A3 ──┬── A6                     │
│       │        │        │                            │
│       └────────┴────────┘                            │
│                    │                                  │
│                    ▼                                  │
│  PHASE 3: Auth chain (sequential)                    │
│  A4 ──→ A5 ──→ A7                                   │
│                  │                                    │
│         ┌───────┴───────┐                            │
│         ▼               ▼                            │
│  PHASE 4: Frontend    PHASE 6: ML low-risk           │
│  C2,C3,C4,C5,C6      B5,B6,B7,B8                    │
│         │               │                            │
│         ▼               ▼                            │
│  PHASE 5: C1         PHASE 7: ML med-risk            │
│  (TanStack Query)    B1, B2, B4                      │
│         │               │                            │
│         │               ▼                            │
│         │            PHASE 8: ML high-risk            │
│         │            B3 ──→ B9                        │
│         │               │                            │
│         └───────┬───────┘                            │
│                 ▼                                     │
│  PHASE 9: D6 (raise CI thresholds to 80%)            │
└─────────────────────────────────────────────────────┘
```

---

## Verification Checklist (Run After ALL Phases Complete)

```bash
# 1. Backend tests + coverage
pytest tests/ -v --cov=api --cov=app_core --cov-report=term-missing --cov-fail-under=80

# 2. Python linting
ruff check api/ app_core/ tests/
ruff format --check api/ app_core/ tests/

# 3. Python type checking
mypy --ignore-missing-imports api/

# 4. Frontend lint
cd frontend && npx eslint src/

# 5. Frontend type check
cd frontend && npx tsc --noEmit

# 6. Frontend tests + coverage
cd frontend && npx vitest run --coverage

# 7. Frontend production build
cd frontend && npm run build

# 8. ML determinism check
python -c "
from tests.conftest import *
# Train twice, compare — should be identical
"

# 9. Security check
# Verify no secrets in codebase
grep -r 'admin123\|user123\|change-me' api/ frontend/src/ --include='*.py' --include='*.ts' --include='*.tsx'
# Should return 0 results (only in PLAN.md documentation)
```

---

## Progress Tracker

| Commit | Status | Notes |
|--------|--------|-------|
| D1 | [ ] PENDING | Pin dependency versions |
| D2 | [ ] PENDING | Create optimization_tasks.py |
| D3 | [ ] PENDING | Pydantic job schemas |
| D4 | [ ] PENDING | Fix forecast RMSE bug |
| D5 | [ ] PENDING | Add vitest.config.ts |
| D6 | [ ] PENDING | CI thresholds (do LAST) |
| A1 | [ ] PENDING | Secret key validation |
| A2 | [ ] PENDING | CORS restriction |
| A3 | [ ] PENDING | Upload validation |
| A4 | [ ] PENDING | JWT claim validation |
| A5 | [ ] PENDING | WebSocket auth |
| A6 | [ ] PENDING | DatasetStore thread safety |
| A7 | [ ] PENDING | Cookie auth migration |
| C1 | [ ] PENDING | TanStack Query |
| C2 | [ ] PENDING | Login timer leak |
| C3 | [ ] PENDING | SSR localStorage guard |
| C4 | [ ] PENDING | Error Boundary |
| C5 | [ ] PENDING | Type safety |
| C6 | [ ] PENDING | Accessibility |
| B1 | [ ] PENDING | LSTM/ANN seeds |
| B2 | [ ] PENDING | XGBoost search seed |
| B3 | [ ] PENDING | Sequence leakage fix |
| B4 | [ ] PENDING | NaN imputation |
| B5 | [ ] PENDING | Exception handling |
| B6 | [ ] PENDING | MAPE stability |
| B7 | [ ] PENDING | CV seed reset |
| B8 | [ ] PENDING | date_col config |
| B9 | [ ] PENDING | Conformal warning |
