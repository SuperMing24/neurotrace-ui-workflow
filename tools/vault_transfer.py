"""Private storage transfer. Signed URLs arrive via hidden stdin, never argv or files."""
from pathlib import Path
import getpass,hashlib,json,sys,urllib.request,urllib.error,urllib.parse

HOST='br-aged-union-aorlespe.storage.c-2.ap-southeast-1.aws.neon.tech'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):return None
OPEN=urllib.request.build_opener(NoRedirect()).open
def validate(url):
    u=urllib.parse.urlsplit(url)
    if u.scheme!='https' or u.hostname!=HOST or not u.path.startswith('/neurotrace-engineering-vault/') or u.username or u.password:raise ValueError('Unexpected custody endpoint')
    return url
def main():
    payload=json.loads(getpass.getpass('Private transfer request (hidden): '))
    results=[]
    for job in payload['jobs']:
        download_only=job.get('operation')=='download'
        if download_only:
            name=job['name']
            if Path(name).name!=name or '/' in name or '\\' in name:raise ValueError('Unsafe recovery filename')
        else:
            path=Path(job['path']);name=path.name;data=path.read_bytes()
            if hashlib.sha256(data).hexdigest()!=job['sha256']:raise ValueError('Local source hash mismatch')
            req=urllib.request.Request(validate(job['upload']),data=data,method='PUT',headers={'Content-Type':'application/zip'})
            with OPEN(req,timeout=120) as r:
                if r.status not in (200,201,204):raise ValueError('Upload refused')
        target=Path(payload['downloadDirectory'])/name
        if target.exists():raise ValueError('Never overwrite an existing recovery download')
        target.parent.mkdir(parents=True,exist_ok=True)
        with OPEN(validate(job['download']),timeout=120) as r: recovered=r.read()
        if hashlib.sha256(recovered).hexdigest()!=job['sha256']:raise ValueError('Downloaded bytes mismatch')
        target.write_bytes(recovered)
        anonymous=urllib.parse.urlsplit(job['download'])._replace(query='').geturl()
        try:
            with OPEN(anonymous,timeout=30) as r: code=r.status
        except urllib.error.HTTPError as e:code=e.code
        if code not in (401,403,404):raise ValueError('Anonymous object request was not denied')
        result={'key':job['key'],'sha256':job['sha256'],'bytes':len(recovered),'verifiedDownload':True,'roundTripVerified':not download_only,'anonymousStatus':code}
        results.append(result);print(json.dumps(result),flush=True)
    receipt=Path(payload['receipt'])
    receipt.write_text(json.dumps({'objects':results,'signedUrlsPersisted':False},indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':
    try:main()
    except Exception as e:
        print(json.dumps({'errorType':type(e).__name__,'httpStatus':getattr(e,'code',None),'details':'Transfer stopped; signed request details suppressed.'}),flush=True)
        sys.exit(1)
