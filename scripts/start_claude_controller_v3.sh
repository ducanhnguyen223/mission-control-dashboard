#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 2 ]; then
  echo "usage: start_claude_controller_v3.sh <workdir> <prompt...>" >&2
  exit 2
fi
SESSION_NAME="claude-controller-v3"
WORKDIR="$1"
shift
PROMPT="$*"
SCRIPT="/root/.openclaw/workspace/scripts/claude_controller_v3.py"
python3 -m py_compile "$SCRIPT"
tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true
CLAUDE_V3_WORKDIR="$WORKDIR" CLAUDE_V3_PROMPT="$PROMPT" tmux new-session -d -s "$SESSION_NAME" "python3 $SCRIPT"
echo "$SESSION_NAME started"
