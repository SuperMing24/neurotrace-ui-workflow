"""Freeze a numbered public frontend once; verify stored bytes before publication."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
HISTORY=ROOT/'history'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def numbered(v):
 if len(v.split('.')) not in (2,3) or not all(s.isdigit() for s in v.split('.')):raise ValueError('Invalid numeric version')
 return tuple(map(int,v.split('.')))
def files(src):
 for p in sorted(src.rglob('*')):
  rel=p.relative_to(src)
  if not p.is_file() or any(x.startswith('.') or x=='__pycache__' for x in rel.parts):continue
  if rel.parts[0] in {'assets','data'} or str(rel)=='docs/TAURUS_SKY.html' or (len(rel.parts)==1 and p.suffix in {'.css','.js','.html','.json'} and p.name!='vercel.json'):yield p,rel
def dump(p,data):p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def live_version():
 v=json.loads((ROOT/'release.json').read_text())['version']
 return v[:-2] if len(v.split('.'))==3 and v.endswith('.0') else v
def freeze(v,src,meta,override=None):
 numbered(v);target=HISTORY/v
 if target.exists():raise ValueError('Archive already exists: '+v)
 stage=HISTORY/('.pending-'+v);stage.mkdir(parents=True)
 try:
  filehash={};changes={}
  for srcfile,rel in files(src):
   d=stage/('screen.txt' if rel==Path('index.html') else rel);d.parent.mkdir(exist_ok=True,parents=True)
   variant=override/rel if override else None
   if variant and rel==Path('mail17.js') and variant.is_file():
    shutil.copyfile(variant,d);changes[str(rel)]={'originalSHA256':digest(srcfile),'reason':'账号私信不随公开试玩归档。'}
   elif rel==Path('workflow.html') and 'href="/"' in srcfile.read_text():
    d.write_text(srcfile.read_text().replace('href="/"','href="./"'));changes[str(rel)]={'originalSHA256':digest(srcfile),'reason':'返回链接指向本版。'}
   else:shutil.copyfile(srcfile,d)
   filehash[d.relative_to(stage).as_posix()]=digest(d)
  if not (stage/'screen.txt').is_file():raise ValueError('Missing index.html')
  shutil.copyfile(ROOT/'review/entry.html',stage/'index.html')
  data=override/'public-data.json' if override else None
  if data and data.is_file():shutil.copyfile(data,stage/'public-data.json');filehash['public-data.json']=digest(stage/'public-data.json')
  filehash['index.html']=digest(stage/'index.html')
  dump(stage/'manifest.json',{'version':v,'publicData':bool(data and data.is_file()),'meta':meta,'files':filehash,'changes':changes})
  stage.rename(target)
 except Exception:
  shutil.rmtree(stage,ignore_errors=True);raise
def registry():
 rec=[json.loads(x.read_text()) for x in HISTORY.glob('*/manifest.json')]
 versions=[{'id':r['version'],**{k:r['meta'].get(k) for k in ['label','summary','kind','original']}} for r in sorted(rec,key=lambda r:numbered(r['version']),reverse=True)]
 return {'current':live_version(),'versions':versions}
def verify():
 cat=json.loads((ROOT/'review/catalog.json').read_text())
 if cat!=registry():raise ValueError('Unpublished or missing archive')
 for v in cat['versions']:
  d=HISTORY/v['id'];m=json.loads((d/'manifest.json').read_text())
  if {p.relative_to(d).as_posix():digest(p) for p in d.rglob('*') if p.is_file() and p!=d/'manifest.json'}!=m['files']:raise ValueError('Archive bytes changed: '+v['id'])
 m=json.loads((HISTORY/live_version()/'manifest.json').read_text())
 for p,rel in files(ROOT):
  n='screen.txt' if rel==Path('index.html') else rel.as_posix()
  expected=m.get('changes',{}).get(str(rel),{}).get('originalSHA256',m['files'].get(n))
  if digest(p)!=expected:raise ValueError('Live source diverged from its frozen version: '+str(rel))
if __name__=='__main__':
 ap=argparse.ArgumentParser();sub=ap.add_subparsers(dest='command',required=True)
 new=sub.add_parser('freeze');new.add_argument('version');new.add_argument('--label',required=True);new.add_argument('--summary',required=True)
 sub.add_parser('verify');args=ap.parse_args()
 if args.command=='freeze':
  if args.version!=live_version():ap.error('Set release.json first')
  freeze(args.version,ROOT,dict(label=args.label,summary=args.summary,kind='release',original=None))
  dump(ROOT/'review/catalog.json',registry())
 verify();print('Verified '+str(len(registry()['versions']))+' releases.')
