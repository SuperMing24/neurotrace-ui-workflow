"""Produce a new ignored local verification tree. Never tag, push, deploy or run SQL."""
from pathlib import Path
from datetime import datetime, timedelta, timezone
import hashlib
import json
import os
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def main():
    subprocess.run([sys.executable, '-X', 'utf8', str(ROOT/'tools/check_engineering.py')], cwd=ROOT, check=True)
    result = subprocess.run([sys.executable, '-X', 'utf8', str(ROOT/'tools/public_manifest.py')],
                            cwd=ROOT, check=True, capture_output=True, text=True, encoding='utf-8',
                            env={**os.environ, 'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8'})
    manifest = json.loads(result.stdout)
    stamp = datetime.now(timezone(timedelta(hours=8))).strftime('%Y%m%d-%H%M%S-%f')
    output = ROOT / 'build' / ('engineering-' + stamp)
    output.mkdir(parents=True, exist_ok=False)
    public = output / 'public'
    public.mkdir()
    for entry in manifest:
        source = (ROOT / entry['file']).resolve()
        target = (public / entry['file']).resolve()
        if not source.is_relative_to(ROOT) or not target.is_relative_to(public.resolve()):
            raise ValueError('Source manifest path outside project')
        raw = source.read_bytes()
        if len(raw) != entry['size'] or hashlib.sha1(raw).hexdigest() != entry['sha']:
            raise ValueError('Manifest input changed: ' + entry['file'])
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        if target.read_bytes() != raw:
            raise ValueError('Local artifact copy mismatch: ' + entry['file'])
    summary = {'purpose': 'local verification only; private overlay and unresolved recording rights; not approved for distribution',
               'existingVersion': json.loads((ROOT/'release.json').read_text(encoding='utf-8'))['version'],
               'files': len(manifest), 'bytes': sum(x['size'] for x in manifest),
               'deployed': False, 'tagged': False, 'versionBumped': False, 'databaseWrites': False}
    (output/'source-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (output/'LOCAL_ONLY.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'output': str(output), **summary}, ensure_ascii=False))

if __name__ == '__main__':
    main()
