"""Read-only recovery from the independent private archive. No SDK or deploy calls."""
from pathlib import Path
import getpass
import hashlib
import json
import sys
import urllib.error
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
STORE_ID = 'store_1JC9tZvU20AfIzbz'
HOST = '1jc9tzvu20afizbz.private.blob.vercel-storage.com'


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def recover(payload):
    index = json.loads((ROOT / 'docs/engineering/private-custody-index.json').read_text(encoding='utf-8'))
    if index['primary']['storeId'] != STORE_ID:
        raise ValueError('Review the archive identity before recovery')
    destination = Path(payload['destination']).resolve()
    if destination.is_relative_to(ROOT) or destination.exists():
        raise ValueError('Use a new recovery directory outside the public repository')
    token = payload['token']
    if not token.startswith('vercel_blob_rw_') or any(c.isspace() for c in token):
        raise ValueError('Expected the existing archive credential through hidden input')
    opener = urllib.request.build_opener(NoRedirect())
    jobs = index['objects']
    if len({x['key'] for x in jobs}) != len(jobs):
        raise ValueError('Duplicate archive key')
    # Validate the complete index before making requests or creating files.
    for job in jobs:
        if Path(job['key']).name != job['key'] or any(x in job['key'] for x in ('/', '\\', ':')):
            raise ValueError('Unsafe archive key')
    destination.mkdir(parents=True, exist_ok=False)
    verified = []
    for job in jobs:
        url = 'https://' + HOST + '/' + urllib.parse.quote(job['key'], safe='')
        request = urllib.request.Request(url, headers={'Authorization': 'Bearer ' + token})
        with opener.open(request, timeout=120) as response:
            raw = response.read()
        if len(raw) != job['bytes'] or hashlib.sha256(raw).hexdigest() != job['sha256']:
            raise ValueError('Recovered bytes failed the published checksum')
        try:
            with opener.open(url, timeout=30) as response:
                anonymous = response.status
        except urllib.error.HTTPError as error:
            anonymous = error.code
        if anonymous not in (401, 403, 404):
            raise ValueError('Anonymous read was not denied')
        (destination / job['key']).write_bytes(raw)
        result = {**job, 'downloadVerified': True, 'anonymousStatus': anonymous}
        verified.append(result)
        print(json.dumps({'key': job['key'], 'bytes': len(raw), 'verified': True,
                          'anonymousStatus': anonymous}), flush=True)
    receipt = {'storeId': STORE_ID, 'objects': verified, 'credentialsPersisted': False,
               'sourceFilesRequired': False, 'cloudWrites': False}
    (destination / 'recovery-receipt.json').write_text(json.dumps(receipt, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    try:
        request_text = getpass.getpass('Archive recovery request (hidden): ') if sys.stdin.isatty() else sys.stdin.read()
        recover(json.loads(request_text))
    except Exception as error:
        print(json.dumps({'errorType': type(error).__name__, 'httpStatus': getattr(error, 'code', None),
                          'details': 'Recovery stopped; credentials and response details concealed.'}), flush=True)
        sys.exit(1)
