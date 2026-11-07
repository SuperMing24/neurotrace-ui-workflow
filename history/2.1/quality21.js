// Local practice assessment. The server ledger remains authoritative for wallet transactions.
window.NeuroQuality = (() => {
  'use strict';
  const scoreFloor = 85, needed = 4;
  const decisions = {keep:'保留候选', revisit:'建议重查', uncertain:'证据不足'};
  const safe = text => String(text ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);
  const pair = (a,b) => [a,b].sort().join('|');
  const rated = n => Number.isInteger(n) && n >= 0 && n <= 100;
  const count = n => Number.isSafeInteger(n) && n >= 0 && n <= 200;
  let knownChapters=[], remote=null;
  const official = () => window.NeuroIdentity?.session?.()?.id;
  const scoresFor = data => official() ? (remote?.owner===official()?remote.scores:{}) : (data?.scores || {});
  const cloudCleared = c => Boolean(official() && remote?.owner===official() && remote.scores[c.id]?.best===100);
  function refreshUI() {
    if (typeof state==='undefined' || !['game','archive'].includes(state.page) || typeof render!=='function') return;
    const root=document.getElementById?.('app');
    if (!root) {render();return;}
    if (state.page==='game' && !root.querySelector('.q21-panel,.q21-result')) return;
    // Leave a review form intact while the player is annotating either projection.
    if (root.querySelector('.q21-review[open]')) return;
    const scroller='.normal-page,.overlay .sheet';
    const y=root.querySelector(scroller)?.scrollTop ?? 0;
    const active=document.activeElement, controls='button, summary, a';
    const focusKey=el=>el.id || JSON.stringify([el.tagName,el.dataset,el.getAttribute('href'),el.textContent]);
    const focused=root.contains(active) && active.matches(controls) ? focusKey(active) : null;
    const opened=new Set(Array.from(root.querySelectorAll('details[open]>summary'),s=>s.textContent));
    render();
    for(const s of root.querySelectorAll('details>summary')) if(opened.has(s.textContent))s.parentElement.open=true;
    const target=root.querySelector(scroller);
    if(target)target.scrollTop=y;
    if(focused)Array.from(root.querySelectorAll(controls)).find(el=>focusKey(el)===focused)?.focus({preventScroll:true});
  }
  function enqueue(session, submission, preview) {
    if (!session || session.owner!==official()) return;
    const active = () => remote===session && session.owner===official();
    session.pending++;
    session.queue=session.queue.then(async()=>{
      if (!active()) return;
      const res=await fetch('/api/practice', {
        method: submission?'POST':'GET', credentials:'same-origin',cache:'no-store',
        ...(submission?{headers:{'Content-Type':'application/json'},body:JSON.stringify({...submission,accountId:session.owner})}:{})
      });
      if (!res.ok) throw new Error('sync');
      const snap=await res.json();
      if (!active()) return;
      if (snap?.accountId!==session.owner || !snap.scores || typeof snap.scores!=='object') throw new Error('account');
      const rows={};
      for (const c of knownChapters) {
        const row=snap.scores[NeuroTrace3D.taskAt(c.index).id];
        if (!row) continue;
        if (![row.first,row.best,row.last].every(rated) || row.best<Math.max(row.first,row.last) ||
            ![row.hits,row.extra,row.missing].every(count) || row.hits+row.missing!==c.answer.length) throw new Error('scores');
        rows[c.id]={first:row.first,best:row.best,last:row.last,hits:row.hits,extra:row.extra,missing:row.missing};
      }
      if(submission && !rows[preview.chapter]) throw new Error('score_missing');
      session.scores=rows;
      session.error=false;
      if(preview)preview.status='ready';
    }).catch(()=>{
      if (!active()) return;
      session.error=true;
      if(preview)preview.status='error';
    }).finally(()=>{
      if (active()){session.pending--;refreshUI();}
    });
  }
  function switchAccount(account) {
    if (!account) {remote=null;return;}
    remote={owner:account.id,scores:{},previews:{},pending:0,error:false,queue:Promise.resolve()};
    enqueue(remote);
  }
  function restore(saved, chapters, sides) {
    knownChapters=chapters;
    const data = {scores:{}, reviews:{}};
    for (const c of chapters) {
      const s = saved?.scores?.[c.id];
      if (s && [s.first,s.best,s.last].every(rated) && s.best >= Math.max(s.first,s.last) &&
          [s.hits,s.extra,s.missing].every(count) && s.hits+s.missing===c.answer.length) {
        data.scores[c.id] = {first:s.first,best:s.best,last:s.last,hits:s.hits,extra:s.extra,missing:s.missing};
      }
    }
    for (const side of sides) {
      const id = NeuroTrace3D.taskAt(side.index).id, r = saved?.reviews?.[id];
      if (r && Object.hasOwn(decisions,r.decision) && typeof r.note==='string' && r.note.trim() &&
          typeof r.signature==='string' && r.signature.length <= 6000) {
        data.reviews[id] = {decision:r.decision, note:r.note.slice(0,180), signature:r.signature};
      }
    }
    return data;
  }
  function observe(data, chapter, edges) {
    const key = new Set(chapter.answer.map(([a,b])=>pair(a,b)));
    const placed = new Set(edges.map(e=>pair(e.from,e.to)));
    const hits = [...placed].filter(e=>key.has(e)).length, extra = placed.size-hits, missing = key.size-hits;
    const score = Math.round(200*hits/(key.size+placed.size));
    if (official()) {
      if (remote?.owner!==official()) switchAccount({id:official()});
      const entry={chapter:chapter.id,last:score,hits,extra,missing,status:'pending'};
      remote.previews[chapter.id]=entry;
      enqueue(remote,{sample:NeuroTrace3D.taskAt(chapter.index).id,edges:edges.map(e=>[e.from,e.to])},entry);
      return entry;
    }
    data.scores ??= {};
    const prev = data.scores[chapter.id];
    return data.scores[chapter.id] = {first:prev?.first ?? score, best:Math.max(prev?.best ?? 0,score), last:score,hits,extra,missing};
  }
  function feedback(data, c) {
    const v = official() ? (remote?.owner===official()?remote.previews[c.id]:null) : data?.scores?.[c.id];
    if (!v) return '';
    return '<div class="q21-result"><div class="q21-result-score"><b>'+v.last+'</b><small>/ 100</small></div><div><strong>本次连线评分</strong><span>正确 '+v.hits+' · 多连 '+v.extra+' · 漏连 '+v.missing+'</span>'+
      (official()?'<span class="q21-sync">'+({pending:'正在提交正式成绩…',ready:'正式成绩已记录',error:'本次成绩未获确认，请重新校验。'}[v.status]||'')+'</span>':'')+'</div></div>';
  }
  const mean = (scores,key) => scores.length ? Math.round(scores.reduce((sum,s)=>sum+s[key],0)/scores.length) : '—';
  const mastered = (data,chapters) => chapters.filter(c=>scoresFor(data)[c.id]?.best>=scoreFloor).length;
  const unlocked = (data,chapters,trained) => Boolean(trained && mastered(data,chapters)>=needed);
  function signature(report) {
    return JSON.stringify([report.kind,...new Set((Array.isArray(report.edges)?report.edges:[]).filter(e=>Array.isArray(e)&&e.length===2).map(([a,b])=>pair(a,b)).sort())]);
  }

  // Two orthographic views of the same sample and the exact submitted candidate edges.
  function projection(side, report, axis, label) {
    const t = NeuroTrace3D.taskAt(side.index);
    const xy = p => [80+p[axis]*19,53-p[1]*20].map(v=>v.toFixed(1)).join(',');
    const end = Object.fromEntries(NeuroTrace3D.allEndpointsFor(side.index).map(e=>[e.id,e.xyz]));
    const fibers = t.segments.map(s=>'<polyline points="'+s.p.map(xy).join(' ')+'"/>').join('');
    const links = (Array.isArray(report.edges)?report.edges:[]).filter(e=>Array.isArray(e)&&e.length===2&&Object.hasOwn(end,e[0])&&Object.hasOwn(end,e[1])).map(([a,b])=>
      '<polyline points="'+xy(end[a])+' '+xy(end[b])+'"/>').join('');
    return '<figure><svg role="img" aria-label="'+label+' · '+safe(t.id)+' 报告投影" viewBox="0 0 160 100"><g fill="none" stroke="#8fc8b8" stroke-width="1.8">'+fibers+'</g><g fill="none" stroke="#ffbc7d" stroke-width="2.4" stroke-dasharray="3 2">'+links+'</g></svg><figcaption>'+label+'</figcaption></figure>';
  }
  function reviewCard(data, side, report) {
    const t = NeuroTrace3D.taskAt(side.index), r = data.reviews?.[t.id], sig = signature(report);
    const status = !r ? '待二读' : r.signature===sig ? '已留复核意见' : '原报告已更新';
    const opts = Object.entries(decisions).filter(([k])=>k!=='keep'||report.kind==='candidate');
    return '<details class="q21-review"><summary>'+safe(t.id)+' · '+safe(side.title)+' <small>'+status+'</small></summary>'+
      '<p>复看已登记的观察。原判为'+(report.kind==='candidate'?'「候选连接」':'「证据不足」')+'。青线为样本，琥珀色虚线为原报告中的连线。</p>'+
      '<div class="q21-views">'+projection(side,report,0,'正面 X–Y')+projection(side,report,2,'侧面 Z–Y')+'</div>'+
      '<form data-quality-review="'+safe(t.id)+'"><label>复核意见<select required name="decision"><option value="">选择结论</option>'+
      opts.map(([k,v])=>'<option value="'+k+'"'+(r?.decision===k?' selected':'')+'>'+v+'</option>').join('')+'</select></label>'+
      '<label>观察依据<textarea name="note" required maxlength="180" rows="2" placeholder="例如：从侧面看，哪一对端点的深度有差异？">'+safe(r?.note)+'</textarea></label>'+
      '<button type="submit" class="q21-save">保存本机复核意见</button><span class="q21-saved" role="status"></span></form></details>';
  }
  function panel(data, chapters, sides, records, trained) {
    const rows = scoresFor(data), scores = chapters.map(c=>rows[c.id]).filter(Boolean);
    const got = mastered(data,chapters), ready = unlocked(data,chapters,trained);
    const metric = (n,title) => '<div><b>'+n+'</b><small>'+title+'</small></div>';
    const list = chapters.map(c=>{const s=rows[c.id];return '<li><span>'+safe(c.skill)+'</span><b>'+(s?s.first+' / '+s.best:'尚未校验')+'</b></li>';}).join('');
    const eligible = sides.filter(s=>['uncertain','candidate'].includes(records?.[NeuroTrace3D.taskAt(s.index).id]?.kind));
    return '<section class="q21-panel"><div class="q21-eyebrow">OBSERVER RECORD</div><h3>我的训练记录</h3><div class="q21-metrics">'+
      metric(mean(scores,'first'),'首次均分')+metric(mean(scores,'best'),'最佳均分')+metric(got+' / '+chapters.length,'达标样本')+'</div>'+
      (official()?'<p class="q21-sync">'+(remote?.error?'正式成绩暂未同步。显示上次取得的记录。 <button type="button" data-quality-sync>重新同步</button>':remote?.pending?'正式成绩同步中…':'正式账号成绩 · 云端记录')+'</p>':'<p class="q21-sync">试玩成绩 · 仅存本机</p>')+
      '<details class="q21-details"><summary>查看逐项成绩与评分规则</summary><p>每份教学样本的首次校验和个人最佳各计一次。平均分按已测样本计算，旧版未记录的成绩留空。</p>'+
      '<p>满分 100。正确条数乘以 200，除以提交条数与参考条数之和。多连、漏连都会扣分，重试可以提高最佳成绩。通关仍需完整还原参考连线。</p>'+
      '<strong>训练技能 <span>首次 / 最佳</span></strong><ul>'+list+'</ul></details>'+
      '<div class="q21-desk"><div class="q21-desk-head"><h4>双视角复核席</h4><b>'+(ready?'已开放':'尚未开放')+'</b></div>'+
      (ready ? '<p>选择一份自己的观察报告，对照正面和侧面，再留一份复核意见。意见随本机账号保存，样本的科研状态仍为待复核。</p>'+
          (eligible.length?eligible.map(s=>reviewCard(data,s,records[NeuroTrace3D.taskAt(s.index).id])).join(''):'<p>先进入观察委托，登记一份候选连线或「证据不足」报告。</p>') :
        '<p>完成第一章三份训练，再让任意 '+needed+' 份不同教学样本的最佳成绩达到 '+scoreFloor+' 分，即可复读自己的观察报告并附上依据。</p>')+
      '</div></section>';
  }
  function bind(data,chapters,sides,records,trained) {
    document.querySelectorAll('[data-quality-sync]').forEach(b=>b.addEventListener('click',()=>{
      if (remote?.owner===official() && !remote.pending) {enqueue(remote);refreshUI();}
    }));
    if (!unlocked(data,chapters,trained)) return;
    document.querySelectorAll('[data-quality-review]').forEach(form=>{
      form.addEventListener('submit',e=>{
        e.preventDefault();
        const id=form.dataset.qualityReview, report=records?.[id], d=form.elements.decision.value;
        const input=form.elements.note, note=input.value.trim();
        if (!report || !sides.some(s=>NeuroTrace3D.taskAt(s.index).id===id) || !Object.hasOwn(decisions,d) || (d==='keep'&&report.kind!=='candidate')) return;
        if (!note) {input.setCustomValidity('请写下复核时观察到的现象。');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;}
        data.reviews ??= {};
        data.reviews[id]={decision:d,note:note.slice(0,180),signature:signature(report)};
        persistDemo();
        form.closest('details').querySelector('summary small').textContent='已留复核意见';
        form.querySelector('[role="status"]').textContent='已保存';
      });
    });
  }
  return {restore,observe,feedback,panel,bind,switchAccount,cloudCleared};
})();
