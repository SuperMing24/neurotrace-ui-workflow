"""Print the Vercel source list, including every frozen review release. Run from anywhere."""
import hashlib
import subprocess
import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIRS = {"api", "lib", "data", "assets", "compare", "review", "history"}
subprocess.run([sys.executable, str(ROOT/'tools/freeze_release.py'), 'verify'], stdout=sys.stderr, check=True)
files = []
for p in sorted(ROOT.rglob("*")):
    rel = p.relative_to(ROOT)
    if not p.is_file() or any(s.startswith(".") or s == "__pycache__" for s in rel.parts):
        continue
    root_page = len(rel.parts) == 1 and p.suffix in {".css", ".js", ".html", ".json"}
    if not (root_page or rel.parts[0] in PUBLIC_DIRS or rel.as_posix() == "docs/TAURUS_SKY.html"):
        continue
    if p.suffix.lower() in {".pdf", ".env", ".zip", ".sql", ".pem", ".key"}:
        raise SystemExit(f"Unexpected non-public file: {rel}")
    files.append({"file": rel.as_posix(), "sha": hashlib.sha1(p.read_bytes()).hexdigest(), "size": p.stat().st_size})
print(json.dumps(files, ensure_ascii=False, separators=(",", ":")))
