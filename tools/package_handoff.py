"""Package the clean, tracked public engineering snapshot for ChatGPT. No release."""
from pathlib import Path
import argparse
import hashlib
import io
import json
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def main(output):
    output = output.resolve()
    if output.is_relative_to(ROOT) or output.exists():
        raise ValueError('Use a new package outside the repository')
    if git('status', '--porcelain').strip():
        raise ValueError('Commit the reviewed snapshot before packaging')
    names = git('ls-files', '-z').decode('utf-8').split('\0')[:-1]
    source_archive = zipfile.ZipFile(io.BytesIO(git('archive', '--format=zip', 'HEAD')))
    if {name for name in source_archive.namelist() if not name.endswith('/')} != set(names):
        raise ValueError('Git export rules omitted tracked files; review the snapshot scope')
    records = []
    payloads = {}
    for name in names:
        source_path = ROOT / name
        p = source_path.resolve()
        if not p.is_relative_to(ROOT) or source_path.is_symlink():
            raise ValueError('Unexpected public snapshot path')
        low = name.lower()
        if name in ('api/letters.js', 'tests/verify_private20.cjs') or '/music/' in '/' + low or low.endswith(('.flac', '.mp3', '.wav', '.ogg', '.pem', '.key', '.dump', '.backup')):
            raise ValueError('Private input must not enter the handoff')
        if name.startswith(('.git/', '.vercel/', 'private-vault/', 'build/', 'node_modules/')) or name.startswith('.env') and name != '.env.example':
            raise ValueError('Local state must not enter the handoff')
        # Read committed bytes, avoiding Windows line-ending conversion in the worktree.
        raw = source_archive.read(name)
        if not low.endswith(('.zip', '.jpg', '.png', '.webp')) and b'\0' not in raw:
            if re.search(rb'vercel_blob_rw_[A-Za-z0-9_]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:gh[pousr]_|sk_live_|AKIA)[A-Za-z0-9]{16,}', raw):
                raise ValueError('Potential credential in public snapshot: ' + name)
        payloads[name] = raw
        records.append({'path': name, 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()})
    source_archive.close()
    manifest = {'kind': 'public engineering handoff; not a product release',
                'repository': 'SuperMing24/neurotrace-ui-workflow',
                'commit': git('rev-parse', 'HEAD').decode().strip(),
                'productVersion': json.loads(payloads['release.json'])['version'],
                'excludedPrivateOverlayAndAudio': True, 'files': records}
    readme = ('NeuroTrace engineering handoff / 2026-11-07\n'
              'Existing product baseline: V2.3 (2.3.0). This is not a new release.\n'
              'Source commit: ' + manifest['commit'] + '\n'
              'Start: docs/CHATGPT_NEXT_ITERATION.md, docs/PROJECT_STATUS.md, '
              'docs/engineering/SOURCE_ALIGNMENT.md.\n'
              'Keep review/shell.js and review/shell.css: the version selector now belongs '
              'inside the left workflow rail. This change has not been deployed.\n'
              'Private letters, corresponding tests, secrets and unconfirmed-license audio '
              'are excluded. See PRIVATE_CUSTODY.md for separate authorized recovery.\n')
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'x', zipfile.ZIP_DEFLATED) as z:
        for name, raw in sorted(payloads.items()):
            z.writestr(name, raw)
        z.writestr('SNAPSHOT_MANIFEST.json', json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
        z.writestr('HANDOFF_README.txt', readme)
    with zipfile.ZipFile(output) as z:
        if z.testzip() is not None or set(z.namelist()) != set(payloads) | {'SNAPSHOT_MANIFEST.json', 'HANDOFF_README.txt'}:
            raise ValueError('Snapshot archive structure mismatch')
        for row in records:
            raw = z.read(row['path'])
            if hashlib.sha256(raw).hexdigest() != row['sha256'] or len(raw) != row['bytes']:
                raise ValueError('Snapshot archive hash mismatch')
    sha = hashlib.sha256(output.read_bytes()).hexdigest()
    output.with_suffix('.zip.sha256').write_text(sha + '  ' + output.name + '\n', encoding='utf-8')
    print(json.dumps({'path': str(output), 'files': len(records), 'commit': manifest['commit'],
                      'bytes': output.stat().st_size, 'sha256': sha, 'verified': True}, ensure_ascii=False))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('output', type=Path)
    main(parser.parse_args().output)
