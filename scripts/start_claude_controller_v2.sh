#!/usr/bin/env bash
set -euo pipefail
SESSION_NAME="claude-controller-v2"
SCRIPT="/root/.openclaw/workspace/scripts/claude_controller_v2.py"
python3 -m py_compile "$SCRIPT"
tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
tmux new-session -d -s "$SESSION_NAME" "python3 $SCRIPT"
echo "$SESSION_NAME started"
