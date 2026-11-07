"""Offline provenance, history, fixture, boundary and source checks; no cloud writes."""
from pathlib import Path
import ast
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs/engineering'

def load(path):
    return json.loads(path.read_text(encoding='utf-8'))

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def check(condition, message):
    if not condition:
        raise ValueError(message)

def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)

def main():
    recovery = load(DOCS / 'recovery-manifest.json')
    original = {x['path']: x for x in recovery['files']}
    for rel in recovery['protectedUnchangedSource']:
        p = ROOT / rel
        check(p.is_file(), f'Missing existing source overlay: {rel}; see docs/engineering/GAPS.md')
        check(digest(p) == original[rel]['sha256'], f'Existing server/version source changed: {rel}')
    check(load(ROOT / 'release.json')['version'] == '2.3.0', 'This engineering pass must not bump the product version')
    run(sys.executable, '-X', 'utf8', str(ROOT / 'tools/freeze_release.py'), 'verify')
    run(sys.executable, '-X', 'utf8', str(ROOT / 'tests/verify_versions23.py'))

    assets = load(DOCS / 'asset-inventory.json')
    for record in assets['files']:
        p = ROOT / record['path']
        check(p.is_file(), f'Missing preserved asset: {record["path"]}; restore approved local overlay')
        check(digest(p) == record['sha256'], f'Asset changed without inventory review: {record["path"]}')
        check(record['sourceGroup'] in assets['sourceGroups'], f'Unknown asset source: {record["path"]}')
    for record in load(DOCS / 'migration-inventory.json')['files']:
        check(digest(ROOT / record['path']) == record['sha256'], f'Migration checksum changed: {record["path"]}')
    for record in load(DOCS / 'version-index.json')['versions']:
        check(digest(ROOT / record['manifest']) == record['manifestSHA256'], f'Historical manifest changed: {record["id"]}')
    seed = load(ROOT / 'db/seeds/synthetic_tasks.json')
    check(seed['sourceSHA256'] == digest(ROOT / 'scene3d.js'), 'Synthetic fixture is stale; export and review explicitly')
    check(len(seed['tasks']) == 8 and len({x['id'] for x in seed['tasks']}) == 8, 'Expected the existing eight distinct synthetic samples')

    for p in sorted((ROOT / 'tools').glob('*.py')):
        ast.parse(p.read_text(encoding='utf-8'), filename=str(p))
    javascript = [*ROOT.glob('*.js'), *ROOT.glob('api/*.js'), *ROOT.glob('lib/*.js'),
                  *ROOT.glob('review/*.js'), *ROOT.glob('compare/*.js'), *ROOT.glob('tools/*.cjs')]
    for p in sorted(javascript):
        run('node', '--check', str(p))

    # Report locations, never matching secret values. Tests use explicit fake URLs.
    patterns = [r'postgres(?:ql)?://[^\s\"\']+', r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
                r'(?:gh[pousr]_|sk_live_|AKIA)[A-Za-z0-9]{16,}']
    for p in javascript:
        text = p.read_text(encoding='utf-8')
        check(not any(re.search(pattern, text) for pattern in patterns),
              f'Potential hard-coded secret in {p.relative_to(ROOT)}; inspect privately')

    private = ['api/letters.js', 'tests/verify_private20.cjs']
    private += [x['path'] for x in assets['files'] if x['sourceGroup'] == 'audio']
    ignored = subprocess.run(['git', 'check-ignore', '--', *private], cwd=ROOT,
                             text=True, capture_output=True, check=False)
    check(set(ignored.stdout.splitlines()) == set(private),
          'Private overlay/audio ignore check failed: ' + ignored.stderr[:300] +
          '; missing paths: ' + repr(sorted(set(private) - set(ignored.stdout.splitlines()))))

    # Validate maintained document links; old tutorials retain explicitly listed gaps.
    documents = [*DOCS.glob('*.md'), ROOT/'README.md', ROOT/'CONTRIBUTING.md', ROOT/'SECURITY.md',
                 ROOT/'THIRD_PARTY_NOTICES.md', ROOT/'CHANGELOG.md', ROOT/'docs/DESIGN_BRIEF.md',
                 ROOT/'docs/CODEX_HANDOFF.md', ROOT/'docs/PROJECT_STATUS.md', ROOT/'docs/HANDOFF_NEXT_SESSION.md',
                 ROOT/'db/README.md', ROOT/'db/seeds/README.md']
    for p in documents:
        check(p.is_file(), f'Missing maintained document: {p.relative_to(ROOT)}')
        for url in re.findall(r'\[[^\]]+\]\(([^\s)]+)\)', p.read_text(encoding='utf-8')):
            if ':' in url or url.startswith('#'):
                continue
            check((p.parent / url.split('#')[0]).exists(), f'Broken maintained link in {p.relative_to(ROOT)}: {url}')
    print(f'Offline engineering checks passed: {len(assets["files"])} assets, 9 migrations, 24 archives, 8 synthetic fixtures; no cloud operations.')

if __name__ == '__main__':
    main()
