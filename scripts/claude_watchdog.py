#!/usr/bin/env python3
import hashlib
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SESSION = os.environ.get("CLAUDE_TMUX_SESSION", "claude")
PANE = os.environ.get("CLAUDE_TMUX_PANE", f"{SESSION}:0.0")
POLL_SECONDS = float(os.environ.get("CLAUDE_WATCHDOG_POLL_SECONDS", "2.0"))
LOG_PATH = Path(os.environ.get("CLAUDE_WATCHDOG_LOG", "/root/.openclaw/workspace/memory/claude-watchdog.log"))
STATE_PATH = Path(os.environ.get("CLAUDE_WATCHDOG_STATE", "/root/.openclaw/workspace/memory/claude-watchdog.state"))

YES_NO_RE = re.compile(r"\bYes\b.*\bNo\b|\bNo\b.*\bYes\b", re.IGNORECASE | re.DOTALL)
PRESS_ENTER_RE = re.compile(r"Press Enter to continue|enter to continue", re.IGNORECASE)
INTERRUPTED_RE = re.compile(r"Interrupted\s*·\s*What should Claude do instead\?", re.IGNORECASE)
EXTERNAL_RE = re.compile(r"\b(push|remote|github|deploy|publish|production|dns|domain|email|send)\b", re.IGNORECASE)
DESTRUCTIVE_RE = re.compile(r"\b(rm\s+-rf|drop database|truncate|delete all|destroy|wipe|format disk)\b", re.IGNORECASE)


def now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(msg: str):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(f"[{now()}] {msg}\n")


def tmux(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["tmux", *args], text=True, capture_output=True)


def session_exists() -> bool:
    return tmux("has-session", "-t", SESSION).returncode == 0


def capture() -> str:
    proc = tmux("capture-pane", "-p", "-t", PANE, "-S", "-140")
    if proc.returncode != 0:
        return ""
    return proc.stdout


def send_literal(text: str):
    subprocess.run(["tmux", "send-keys", "-t", PANE, "-l", "--", text], check=False)


def send_enter():
    subprocess.run(["tmux", "send-keys", "-t", PANE, "Enter"], check=False)


def submit(text: str):
    send_literal(text)
    time.sleep(0.08)
    send_enter()


def pane_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def read_state() -> str:
    try:
        return STATE_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def write_state(value: str):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(value, encoding="utf-8")


def should_answer_yes(text: str) -> bool:
    if not YES_NO_RE.search(text):
        return False
    if DESTRUCTIVE_RE.search(text):
        return False
    if EXTERNAL_RE.search(text):
        return False
    return True


def should_press_enter(text: str) -> bool:
    return bool(PRESS_ENTER_RE.search(text))


def should_pause_for_human(text: str) -> bool:
    return bool(INTERRUPTED_RE.search(text)) or bool(EXTERNAL_RE.search(text) and YES_NO_RE.search(text)) or bool(DESTRUCTIVE_RE.search(text))


def main():
    log(f"watchdog-start session={SESSION} pane={PANE} poll={POLL_SECONDS}s")
    if not session_exists():
        log("session-missing on start")
    last_hash = read_state()
    last_action_at = 0.0
    while True:
        try:
            if not session_exists():
                time.sleep(POLL_SECONDS)
                continue
            text = capture()
            if not text.strip():
                time.sleep(POLL_SECONDS)
                continue
            current_hash = pane_hash(text)
            changed = current_hash != last_hash
            if changed:
                write_state(current_hash)
                last_hash = current_hash
            now_ts = time.time()
            if now_ts - last_action_at < 2.5:
                time.sleep(POLL_SECONDS)
                continue
            if should_answer_yes(text):
                log("action=yes auto-accepted internal yes/no prompt")
                submit("y")
                last_action_at = now_ts
            elif should_press_enter(text):
                log("action=enter auto-continued prompt")
                send_enter()
                last_action_at = now_ts
            elif changed and should_pause_for_human(text):
                tail = " | ".join([ln.strip() for ln in text.splitlines()[-6:] if ln.strip()])
                log(f"attention-needed {tail[:600]}")
            time.sleep(POLL_SECONDS)
        except KeyboardInterrupt:
            log("watchdog-stop keyboard-interrupt")
            return 0
        except Exception as e:
            log(f"error {type(e).__name__}: {e}")
            time.sleep(max(POLL_SECONDS, 3.0))


if __name__ == "__main__":
    sys.exit(main())
