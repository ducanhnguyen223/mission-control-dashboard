#!/usr/bin/env python3
import hashlib
import os
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SESSION = os.environ.get("CLAUDE_TMUX_SESSION", "claude")
PANE = os.environ.get("CLAUDE_TMUX_PANE", f"{SESSION}:0.0")
POLL_SECONDS = float(os.environ.get("CLAUDE_CONTROLLER_POLL_SECONDS", "0.4"))
LOG_PATH = Path(os.environ.get("CLAUDE_CONTROLLER_LOG", "/root/.openclaw/workspace/memory/claude-controller-v2.log"))
STATE_PATH = Path(os.environ.get("CLAUDE_CONTROLLER_STATE", "/root/.openclaw/workspace/memory/claude-controller-v2.state"))

EXTERNAL_WORDS = ("push", "remote", "github", "deploy", "publish", "production", "dns", "domain", "email", "send")
DESTRUCTIVE_WORDS = ("rm -rf", "drop database", "truncate", "delete all", "destroy", "wipe", "format disk")


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(msg: str):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(f"[{now()}] {msg}\n")


def run_tmux(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["tmux", *args], text=True, capture_output=True)


def session_exists(name: str) -> bool:
    return run_tmux("has-session", "-t", name).returncode == 0


def capture() -> str:
    proc = run_tmux("capture-pane", "-p", "-t", PANE, "-S", "-200")
    return proc.stdout if proc.returncode == 0 else ""


def normalize(text: str) -> str:
    return text.replace("\u00a0", " ")


def send_enter():
    subprocess.run(["tmux", "send-keys", "-t", PANE, "Enter"], check=False)


def send_literal(text: str):
    subprocess.run(["tmux", "send-keys", "-t", PANE, "-l", "--", text], check=False)


def submit(text: str):
    send_literal(text)
    time.sleep(0.06)
    send_enter()


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def read_state() -> str:
    try:
        return STATE_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def write_state(value: str):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(value, encoding="utf-8")


def is_external_or_destructive(text: str) -> bool:
    low = text.lower()
    return any(w in low for w in EXTERNAL_WORDS) or any(w in low for w in DESTRUCTIVE_WORDS)


def prompt_line(text: str) -> str:
    lines = [ln.rstrip() for ln in normalize(text).splitlines() if ln.strip()]
    for ln in reversed(lines[-12:]):
        if "❯" in ln:
            return ln.strip()
    return lines[-1].strip() if lines else ""


def detect_action(text: str) -> tuple[str, str]:
    t = normalize(text)
    low = t.lower()
    pline = prompt_line(t).lower()

    if is_external_or_destructive(t):
        return ("pause", "external-or-destructive")

    if "do you want to make this edit to" in low and "1. yes" in low and "2. yes, allow all edits during this session" in low and "3. no" in low:
        if "❯ 1. yes" in pline or pline == "❯ 1. yes":
            return ("enter", "edit-approval-selected-yes")
        return ("submit:1", "edit-approval")

    if "con/resume" in low or pline in ("❯ con/resume", "❯ resume", "resume", "con/resume"):
        return ("submit:resume", "resume-prompt")

    if "press enter to continue" in low or "enter to continue" in low:
        return ("enter", "continue-enter")

    if "does this section look right" in low and "(yes/no)" in low:
        return ("submit:yes", "section-approval")

    continue_phrases = (
        "yes, continue",
        "continue to next section",
        "continue",
        "proceed",
        "go ahead",
        "next section",
        "next step",
        "keep going",
    )
    if any(p in low for p in continue_phrases):
        return ("submit:yes", "continue-prompt")

    if "yes" in low and "no" in low:
        return ("submit:yes", "yes-no")

    return ("none", "no-match")


def perform(action: str):
    if action == "enter":
        send_enter()
        return
    if action.startswith("submit:"):
        submit(action.split(":", 1)[1])
        return


def main() -> int:
    log(f"controller-start session={SESSION} pane={PANE} poll={POLL_SECONDS}s")
    last_hash = read_state()
    last_action_key = ""
    last_action_at = 0.0

    while True:
        try:
            if not session_exists(SESSION):
                time.sleep(POLL_SECONDS)
                continue

            text = capture()
            if not text.strip():
                time.sleep(POLL_SECONDS)
                continue

            current_hash = hash_text(text)
            changed = current_hash != last_hash
            if changed:
                write_state(current_hash)
                last_hash = current_hash

            action, reason = detect_action(text)
            key = f"{reason}:{prompt_line(text)}"
            now_ts = time.time()

            if action != "none":
                if action == "pause":
                    if changed or key != last_action_key:
                        log(f"pause {reason} :: {prompt_line(text)}")
                        last_action_key = key
                else:
                    if changed or key != last_action_key or now_ts - last_action_at > 4.0:
                        log(f"action {action} :: {reason} :: {prompt_line(text)}")
                        perform(action)
                        last_action_key = key
                        last_action_at = now_ts

            time.sleep(POLL_SECONDS)
        except KeyboardInterrupt:
            log("controller-stop keyboard-interrupt")
            return 0
        except Exception as e:
            log(f"error {type(e).__name__}: {e}")
            time.sleep(1.0)


if __name__ == "__main__":
    sys.exit(main())
