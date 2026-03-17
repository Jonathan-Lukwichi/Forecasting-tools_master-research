#!/usr/bin/env python3
"""
Auto-commit hook for Claude Code — commits after file edits.

Branch-aware workflow (CLAUDE.md compliance):
- On a feature branch: auto-commit + auto-push to that branch
- On main: auto-commit locally only (NO push) — forces use of PRs
"""
import json
import sys
import subprocess
import os
from datetime import datetime


def get_current_branch(project_dir):
    """Return the name of the current git branch."""
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        capture_output=True,
        text=True,
        cwd=project_dir,
    )
    return result.stdout.strip() if result.returncode == 0 else "main"


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    file_path = tool_input.get("file_path", "")

    # Only process Edit or Write operations
    if tool_name not in ("Edit", "Write") or not file_path:
        sys.exit(0)

    # Get project directory
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    os.chdir(project_dir)

    # Get relative path for commit message
    try:
        rel_path = os.path.relpath(file_path, project_dir)
    except ValueError:
        rel_path = os.path.basename(file_path)

    # Stage the file
    subprocess.run(["git", "add", file_path], capture_output=True)

    # Check if there are staged changes
    result = subprocess.run(
        ["git", "diff", "--cached", "--quiet"],
        capture_output=True,
    )

    if result.returncode == 0:
        sys.exit(0)  # Nothing to commit

    # Create commit message with timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    commit_msg = f"Update: {rel_path} [{timestamp}]"

    # Commit
    subprocess.run(
        ["git", "commit", "-m", commit_msg],
        capture_output=True,
    )

    # Branch-aware push:
    #   feature branch → push to that branch (safe, isolated)
    #   main           → do NOT push (requires PR to merge)
    branch = get_current_branch(project_dir)

    if branch != "main":
        subprocess.run(
            ["git", "push", "origin", branch],
            capture_output=True,
        )

    sys.exit(0)


if __name__ == "__main__":
    main()
