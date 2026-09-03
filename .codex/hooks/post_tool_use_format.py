#!/usr/bin/env python3
"""Format files changed by Codex Edit/Write tools."""

import json
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PRETTIER_EXTENSIONS = {".css", ".html", ".js", ".json", ".jsx", ".md", ".mdx", ".scss", ".ts", ".tsx", ".yaml", ".yml"}


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for child in value.values():
            yield from strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from strings(child)


def changed_files(event):
    values = list(strings(event.get("tool_input", {})))
    candidates = set()
    for value in values:
        candidates.update(re.findall(r"(?:^|[\s'\"])([^\s'\"]+\.(?:java|css|html|js|json|jsx|md|mdx|scss|ts|tsx|yaml|yml))(?:$|[\s'\"])", value))
        path = Path(value)
        if path.suffix == ".java" or path.suffix in PRETTIER_EXTENSIONS:
            if value.startswith(("frontend/", "backend-spring/", "src/")):
                candidates.add(value)

    result = set()
    for candidate in candidates:
        path = Path(candidate)
        if path.is_absolute():
            try:
                path = path.resolve().relative_to(REPO_ROOT)
            except ValueError:
                continue
        normalized = path.as_posix().removeprefix("./")
        if (REPO_ROOT / normalized).is_file():
            result.add(normalized)
    return result


def main():
    try:
        event = json.load(sys.stdin)
    except (json.JSONDecodeError, OSError):
        return 0

    files = changed_files(event)
    java_files = sorted(path for path in files if path.startswith("backend-spring/src/") and path.endswith(".java"))
    frontend_files = sorted(path.removeprefix("frontend/") for path in files if path.startswith("frontend/src/") and Path(path).suffix in PRETTIER_EXTENSIONS)
    messages = []

    if java_files:
        result = subprocess.run(["./mvnw", "spotless:apply"], cwd=REPO_ROOT / "backend-spring", check=False)
        if result.returncode:
            return result.returncode
        messages.append(f"ran Spotless for {len(java_files)} Java file(s)")

    if frontend_files:
        result = subprocess.run(["npm", "run", "format", "--", *frontend_files], cwd=REPO_ROOT / "frontend", check=False)
        if result.returncode:
            return result.returncode
        messages.append(f"ran Prettier for {len(frontend_files)} frontend file(s)")

    if messages:
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse", "additionalContext": "; ".join(messages)}}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
