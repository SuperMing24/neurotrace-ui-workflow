"""Exercise the future release pipeline on a temporary, isolated two-version project."""
from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile

root=Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as folder:
    temp=Path(folder)
    for path in ('tools/freeze_release.py','review/entry.html'):
        (temp/path).parent.mkdir(exist_ok=True)
        shutil.copyfile(root/path,temp/path)
    def run(*args,ok=True):
        p=subprocess.run([sys.executable,str(temp/'tools/freeze_release.py'),*args],capture_output=True)
        assert (p.returncode==0)==ok,p.stderr.decode()
    for v in ['3.0','3.1']:
        (temp/'release.json').write_text(json.dumps({'version':v+'.0'}))
        (temp/'index.html').write_text('<!doctype html><html><head><title>'+v+'</title></head></html>')
        run('freeze',v,'--label','release','--summary','regression')
        run('freeze',v,'--label','replacement','--summary','reject',ok=False)
    assert '3.0' in (temp/'history/3.0/screen.txt').read_text()
    run('verify')
    (temp/'index.html').write_text('modified after freeze')
    run('verify',ok=False)
    shutil.copyfile(temp/'history/3.1/screen.txt',temp/'index.html')
    (temp/'history/3.0/screen.txt').write_text('historic alteration')
    run('verify',ok=False)
print('Verified version append, same-version refusal, live drift and historical integrity.')
