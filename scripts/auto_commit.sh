#!/bin/bash
# ============================================================================
# Auto-commit and push script for HealthForecast AI
# Called after completing a task when all quality gates pass.
#
# Usage: bash scripts/auto_commit.sh "feat: description of change"
#
# This script:
# 1. Runs pre-commit hooks on all staged files
# 2. Commits with conventional commit message
# 3. Pushes to the current branch
# ============================================================================

set -euo pipefail

COMMIT_MSG="${1:-auto: update from automated workflow}"

echo "=== HealthForecast AI — Auto Commit ==="
echo ""

# 1. Check for changes
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# 2. Stage all changes
echo "[1/5] Staging changes..."
git add -A

# 3. Run pre-commit hooks
echo "[2/5] Running quality gates (pre-commit)..."
if command -v pre-commit &> /dev/null; then
    pre-commit run --all-files || {
        echo ""
        echo "QUALITY GATE FAILED — fix issues and retry."
        echo "Run: pre-commit run --all-files"
        exit 1
    }
else
    echo "  (pre-commit not installed — skipping hooks)"
    echo "  Install with: pip install pre-commit && pre-commit install"
fi

# 4. Re-stage (hooks may have modified files)
git add -A

# 5. Commit
echo "[3/5] Committing..."
git commit -m "${COMMIT_MSG}

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"

# 6. Push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "[4/5] Pushing to origin/${BRANCH}..."
git push origin "${BRANCH}"

echo "[5/5] Done."
echo ""
echo "=== Commit pushed to ${BRANCH} ==="
