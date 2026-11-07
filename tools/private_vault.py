"""Package existing private sources; restore only to a new local directory. No cloud APIs."""
from pathlib import Path
import argparse, hashlib, json, shutil, subprocess, zipfile

ROOT=Path(__file__).resolve().parents[1]
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def record(p, name): return {'path':name,'bytes':p.stat().st_size,'sha256':digest(p)}
def pack(output):
    output=output.resolve()
    if output.is_relative_to(ROOT): raise ValueError('Private archive must stay outside the public repository')
    output.mkdir(parents=True,exist_ok=False)
    private=output/'private-overlay';private.mkdir()
    source=ROOT/'api/letters.js'
    for rel in ['api/letters.js','tests/verify_private20.cjs']:
        target=private/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/rel,target)
    # Only the recovered object literal is evaluated. The API handler is never run.
    script="""const fs=require('node:fs'),vm=require('node:vm');const src=fs.readFileSync(process.argv[1],'utf8');const m=src.match(/const milestones\\s*=([\\s\\S]*?);\\s*const pairs=/);if(!m)throw Error('Template object not found');const data=vm.runInNewContext('('+m[1]+')',{}, {timeout:1000});process.stdout.write(JSON.stringify(data,null,2)+'\\n');"""
    templates=subprocess.check_output(['node','-e',script,str(source)])
    parsed=json.loads(templates)
    if len(parsed)!=2 or sum(sum(k!='title' for k in x) for x in parsed.values())!=4: raise ValueError('Unexpected template shape')
    (private/'templates.json').write_bytes(templates)
    files=[record(p,p.relative_to(private).as_posix()) for p in sorted(private.rglob('*')) if p.is_file()]
    (private/'manifest.json').write_text(json.dumps({'purpose':'private source custody; no production change','sourceSHA256':digest(source),'files':files},indent=2)+'\n',encoding='utf-8')
    overlay=output/'private-overlay.zip'
    with zipfile.ZipFile(overlay,'x',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(private.rglob('*')):
            if p.is_file():z.write(p,p.relative_to(private).as_posix())
    art=output/'available-original-art.zip'
    sources=['docs/echo18-artboard.webp','docs/echo18-ui-concept.webp','docs/NeuroTrace_V17_preview.jpg','docs/NeuroTrace_V18_preview.jpg','docs/NeuroTrace_V18_Archive_Design.zip','docs/ECHO_ARCHIVE_V18.md']
    with zipfile.ZipFile(art,'x',zipfile.ZIP_DEFLATED) as z:
        for rel in sources:z.write(ROOT/rel,rel)
        z.writestr('custody-manifest.json',json.dumps({'classification':'existing artboard, concept, previews and design delivery; not all original generation masters','files':[record(ROOT/p,p) for p in sources]},indent=2))
    originals=[overlay,art,ROOT.parent/'reference-materials/NeuroTrace_V2.3.zip']
    old=Path(r'E:\User\Downloads\NeuroTrace_V05_Figma_OneShot.zip')
    if old.is_file():originals.append(old)
    result={'files':[{'localPath':str(p),**record(p,p.name)} for p in originals],'templateCount':4,'missingOriginalMasters':['early GUI source images and skin crop manifests','V2.2 six generation masters and per-image prompts','historical three original photographic JPEG inputs and hashes']}
    (output/'custody-local.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'archives':len(originals),'templates':4,'localManifest':str(output/'custody-local.json')},ensure_ascii=False))
def restore(archive,dest,kind='private'):
    if dest.exists():raise ValueError('Restore destination must be new; never overwrite live source')
    manifest_name='manifest.json' if kind=='private' else 'custody-manifest.json'
    allowed={'api/letters.js','tests/verify_private20.cjs','templates.json'} if kind=='private' else {'docs/echo18-artboard.webp','docs/echo18-ui-concept.webp','docs/NeuroTrace_V17_preview.jpg','docs/NeuroTrace_V18_preview.jpg','docs/NeuroTrace_V18_Archive_Design.zip','docs/ECHO_ARCHIVE_V18.md'}
    with zipfile.ZipFile(archive) as z:
        manifest=json.loads(z.read(manifest_name))
        names=z.namelist()
        if len(names)!=len(set(names)):raise ValueError('Duplicate archive entries')
        expected={x['path']:x for x in manifest['files']}
        if set(expected)!=allowed or len(expected)!=len(manifest['files']):raise ValueError('Unexpected recovery file list')
        if set(names)!=set(expected)|{manifest_name}:raise ValueError('Unexpected archive member')
        payloads={}
        for name,rec in expected.items():
            path=(dest/name).resolve()
            if not path.is_relative_to(dest.resolve()):raise ValueError('Unsafe archive path')
            raw=z.read(name)
            if hashlib.sha256(raw).hexdigest()!=rec['sha256'] or len(raw)!=rec['bytes']:raise ValueError('Archive byte mismatch')
            payloads[name]=raw
        dest.mkdir(parents=True)
        for name,raw in payloads.items():
            target=dest/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(raw)
    print(json.dumps({'restoredFiles':len(payloads),'verified':True,'productionTouched':False}))
if __name__=='__main__':
    p=argparse.ArgumentParser();s=p.add_subparsers(dest='action',required=True)
    a=s.add_parser('pack');a.add_argument('output',type=Path)
    a=s.add_parser('restore');a.add_argument('archive',type=Path);a.add_argument('destination',type=Path)
    a=s.add_parser('restore-art');a.add_argument('archive',type=Path);a.add_argument('destination',type=Path)
    a=p.parse_args()
    if a.action=='pack':pack(a.output)
    else:restore(a.archive,a.destination,'art' if a.action=='restore-art' else 'private')
