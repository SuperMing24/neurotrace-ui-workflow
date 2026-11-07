(async()=>{
 const match=location.pathname.match(/^\/history\/(\d+\.\d+(?:\.\d+)?)(?:\/index\.html|\/)?$/);
 if(!match)throw Error('version');
 const dir='/history/'+match[1]+'/';
 const [page,manifest]=await Promise.all([fetch(dir+'screen.txt'),fetch(dir+'manifest.json')]);
 if(!page.ok||!manifest.ok)throw Error('missing');
 const meta=await manifest.json();
 let html=await page.text();
 if(meta.version!==match[1]||!/<head[\s>]/i.test(html))throw Error('entry');
 // The original file stays byte-for-byte in screen.txt. Only review chrome is injected.
 html=html.replace(/<link\b[^>]*data-nt-review[^>]*>/gi,'').replace(/<script\b[^>]*data-nt-review[^>]*><\/script>/gi,'');
 const head='<base href="'+dir+'"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="form-action \'none\'; base-uri \'self\'; object-src \'none\'; connect-src \'self\'"><script src="/review/archive-runtime.js"'+(meta.publicData?' data-public-data="public-data.json"':'')+'><\/script><link rel="stylesheet" href="/review/shell.css"><script defer src="/review/shell.js"><\/script>';
 const start=/<head(?:\s[^>]*)?>/i.exec(html),offset=start.index+start[0].length;
 window.__ntPendingArchivePage=html.slice(offset);
 // Only start historical scripts after the storage and network guard is fully installed.
 const run='<script>if(window.__ntArchiveGuardReady==="'+match[1]+'"){const originalMarkup=window.__ntPendingArchivePage;delete window.__ntPendingArchivePage;document.write(originalMarkup)}else{document.write(\'<title>无法进入回看</title></head><body><p>历史版本暂未完成隔离，请刷新重试。</p><a href="/">返回正式版</a></body></html>\')}<\/script>';
 document.open();document.write(html.slice(0,offset)+head+run);document.close();
})().catch(()=>{const el=document.getElementById('archive-load-status');if(el)el.textContent='这个版本暂未加载成功。可刷新重试，或返回正式版。';});
