#!/usr/bin/env python3
import hashlib
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import pexpect

WORKDIR = os.environ.get("CLAUDE_V3_WORKDIR", "/root/.openclaw/workspace")
LOG_PATH = Path(os.environ.get("CLAUDE_V3_LOG", "/root/.openclaw/workspace/memory/claude-controller-v3.log"))
STATE_PATH = Path(os.environ.get("CLAUDE_V3_STATE", "/root/.openclaw/workspace/memory/claude-controller-v3.state"))
PROMPT = os.environ.get("CLAUDE_V3_PROMPT", "")
POLL_SECONDS = float(os.environ.get("CLAUDE_V3_POLL_SECONDS", "0.25"))
IDLE_SECONDS = float(os.environ.get("CLAUDE_V3_IDLE_SECONDS", "1.2"))

SAFE_COMMAND_PATTERNS = [
    re.compile(r"npx\s+--yes\s+tsc", re.I),
    re.compile(r"eslint", re.I),
    re.compile(r"next\s+build", re.I),
    re.compile(r"next\s+lint", re.I),
    re.compile(r"npm\s+.*run\s+lint", re.I),
    re.compile(r"npm\s+.*run\s+build", re.I),
    re.compile(r"git\s+diff", re.I),
    re.compile(r"git\s+status", re.I),
    re.compile(r"git\s+add", re.I),
    re.compile(r"ls\s+-la\s+/root/\.openclaw", re.I),
    re.compile(r"ls\s+/root/\.openclaw", re.I),
]

DONE_PATTERNS = [
    re.compile(r"\bDone\.\b", re.I),
    re.compile(r"Commit m(?:ớ|o)i:\s*[0-9a-f]{7,}", re.I),
    re.compile(r"If you want, I can push", re.I),
    re.compile(r"lint\s*✅", re.I),
    re.compile(r"build\s*✅", re.I),
]


def now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def log(msg: str):
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(f"[{now()}] {msg}\n")


def text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8", errors="ignore")).hexdigest()


def read_state() -> str:
    try:
        return STATE_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        return ""


def write_state(value: str):
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(value, encoding="utf-8")


def safe_internal_command(text: str) -> bool:
    return any(p.search(text) for p in SAFE_COMMAND_PATTERNS)


def detect_action(screen: str):
    low = screen.lower()

    if (
        "do you want to make this edit to" in low
        and "1. yes" in low
        and "2. yes, allow all edits during this session" in low
        and "3. no" in low
    ):
        return ("1", "edit-approval")

    if (
        "this command requires approval" in low
        and "do you want to proceed?" in low
        and "1. yes" in low
        and "2. yes" in low
        and "3. no" in low
    ):
        if "allow reading from .openclaw/ from this project" in low:
            return ("2", "openclaw-read-approval")
        if safe_internal_command(screen):
            return ("2", "internal-command-approval")
        return (None, "command-approval-blocked")

    if re.search(r"(^|\n)\s*❯\s*(?:con/)?resume\s*$", screen, re.I | re.M):
        return ("resume", "resume-prompt")

    if re.search(r"Press Enter to continue|enter to continue", screen, re.I):
        return ("__ENTER__", "enter-continue")

    return (None, "no-match")


def looks_done(screen: str) -> bool:
    return any(p.search(screen) for p in DONE_PATTERNS)


def build_command() -> list[str]:
    if not PROMPT:
        raise SystemExit("CLAUDE_V3_PROMPT is required")
    return ["claude", PROMPT]


def main() -> int:
    cmd = build_command()
    log(f"controller-v3-start cwd={WORKDIR} cmd={cmd[0]}")
    child = pexpect.spawn(cmd[0], cmd[1:], cwd=WORKDIR, encoding="utf-8", timeout=None)
    buffer = ""
    last_hash = read_state()
    last_action_key = ""
    last_action_at = 0.0
    last_output_at = time.time()

    while True:
        try:
            chunk = child.read_nonblocking(size=4096, timeout=POLL_SECONDS)
            if chunk:
                buffer = (buffer + chunk)[-30000:]
                sys.stdout.write(chunk)
                sys.stdout.flush()
                last_output_at = time.time()
                current_hash = text_hash(buffer)
                if current_hash != last_hash:
                    write_state(current_hash)
                    last_hash = current_hash

                action, reason = detect_action(buffer)
                if action is not None:
                    key = f"{current_hash}:{action}:{reason}"
                    if key != last_action_key and time.time() - last_action_at > 0.8:
                        log(f"action {action} :: {reason}")
                        if action == "__ENTER__":
                            child.sendline("")
                        else:
                            child.sendline(action)
                        last_action_key = key
                        last_action_at = time.time()

                if looks_done(buffer) and time.time() - last_output_at > IDLE_SECONDS:
                    log("milestone done-pattern-detected")

            if not child.isalive():
                log(f"controller-v3-exit status={child.exitstatus} signal={child.signalstatus}")
                return child.exitstatus or 0
        except pexpect.TIMEOUT:
            if not child.isalive():
                log(f"controller-v3-exit status={child.exitstatus} signal={child.signalstatus}")
                return child.exitstatus or 0
            continue
        except pexpect.EOF:
            log(f"controller-v3-eof status={child.exitstatus} signal={child.signalstatus}")
            return child.exitstatus or 0
        except KeyboardInterrupt:
            log("controller-v3-stop keyboard-interrupt")
            try:
                child.terminate(force=True)
            except Exception:
                pass
            return 130
        except Exception as e:
            log(f"error {type(e).__name__}: {e}")
            time.sleep(1.0)


if __name__ == "__main__":
    sys.exit(main())
