// HTML screens and HUD: menus, mode select, challenge select, results, settings, achievements, collection, stats.
(function(){
const $=id=>document.getElementById(id);
const UI={$};
const SCREENS=['title','menu','modes','chal','intro','pause','results','settings','ach','unlocks','stats','confirm'];
const fmt=n=>Math.round(n).toLocaleString('en-US');UI.fmt=fmt;
const clock=t=>{t=Math.max(0,Math.ceil(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');};UI.clock=clock;
UI.show=function(name){for(const s of SCREENS){const el=$('s'+s[0].toUpperCase()+s.slice(1));if(el)el.classList.toggle('hidden',s!==name);}};
UI.thumb=function(def,px,pad){const c=document.createElement('canvas'),dpr=Math.min(2,devicePixelRatio||1);c.width=c.height=px*dpr;const g=c.getContext('2d');const e=SPR.get(def);
 const k=px*dpr/Math.max(e.W,e.H)*(pad||1);g.translate(px*dpr/2,px*dpr/2);g.scale(k,k);if(Math.max(def.w,def.h)>def.w*1.01)g.rotate(0);def.draw(g);return c;};
UI.toast=function(html,cls){const d=document.createElement('div');d.className='toast '+(cls||'');d.innerHTML=html;$('toasts').appendChild(d);setTimeout(()=>d.remove(),2700);while($('toasts').children.length>3)$('toasts').firstChild.remove();};
UI.banner=function(t){const b=$('banner');b.textContent=t;b.classList.remove('hidden');b.style.animation='none';void b.offsetWidth;b.style.animation='';clearTimeout(UI._bt);UI._bt=setTimeout(()=>b.classList.add('hidden'),1650);};
UI.note=function(r){const n=$('note');$('who').textContent=r?r.who+':':'';$('ask').textContent=r?r.text:'';$('reply').textContent='';$('stamp').classList.remove('on');n.classList.remove('done','in');void n.offsetWidth;n.classList.add('in');UI.slots(r);};
UI.noteText=function(who,text){$('who').textContent=who;$('ask').textContent=text;$('slots').innerHTML='';$('reply').textContent='';const n=$('note');n.classList.remove('done','in');void n.offsetWidth;n.classList.add('in');};
UI.slots=function(r){const s=$('slots');s.innerHTML='';if(!r||r.slots.length<2)return;r.slots.forEach((sl,i)=>{const sp=document.createElement('span');if(r.filled[i]){sp.className='on';sp.appendChild(UI.thumb(OBJ.DEFS[r.filled[i]],26));}s.appendChild(sp);});};
UI.reply=function(t){$('reply').textContent=t;clearTimeout(UI._rt);UI._rt=setTimeout(()=>{$('reply').textContent='';},2600);};
UI.stamp=function(txt){const s=$('stamp');s.textContent=txt||'GOT IT';s.classList.remove('on');void s.offsetWidth;s.classList.add('on');$('note').classList.add('done');};
let lastHud={};
UI.hud=function(h){if(h.score!==lastHud.score){$('score').textContent=fmt(h.score);}
 const m=h.mult>1?'×'+(Math.round(h.mult*100)/100):'';if(m!==lastHud.m){$('mult').textContent=m;$('mult').classList.remove('pulse');void $('mult').offsetWidth;if(m)$('mult').classList.add('pulse');}
 const c=h.clock===null?'':clock(h.clock);if(c!==lastHud.c){$('clock').textContent=c;$('clock').classList.toggle('hidden',h.clock===null);$('clock').classList.toggle('low',h.clock!==null&&h.clock<=10&&h.clock>0);}
 if(h.strikes!==lastHud.strikes){const s=$('strikes');s.innerHTML='';if(h.strikes!=null)for(let i=0;i<3;i++){const e=document.createElement('i');if(i>=h.strikes)e.className='off';s.appendChild(e);}}
 const tb=$('timerBar');if(h.bar==null)tb.classList.add('hidden');else{tb.classList.remove('hidden');tb.firstChild.style.transform='scaleX('+Math.max(0,Math.min(1,h.bar))+')';tb.firstChild.style.background=h.bar<.25?'#c8392e':'#d98c3a';}
 lastHud={score:h.score,m,c,strikes:h.strikes};};
UI.resetHud=()=>{lastHud={};};
UI.bar=function(sel,o){$('bar').classList.toggle('sel',!!sel);if(sel){$('bTray').textContent=o&&o.tray>=0?'Back':'Tray';}};
UI.inspect=function(o,line){$('insName').textContent=o.d.n;$('insDesc').textContent=line;const el=$('inspect');el.classList.remove('hidden');el.style.animation='none';void el.offsetWidth;el.style.animation='';clearTimeout(UI._it);UI._it=setTimeout(()=>el.classList.add('hidden'),3200);};
UI.tut=function(html){const t=$('tut');if(!html){t.classList.add('hidden');t.innerHTML='';return;}t.innerHTML=html;t.classList.remove('hidden');const nb=$('note').getBoundingClientRect().bottom;t.style.top=(nb+8)+'px';};
// ---------- menus ----------
function modeIcon(id){const map={quick:'flashlight',cleanout:'tape',bottomless:'padlock',daily:'receipt',free:'rubber_ball'};return UI.thumb(OBJ.DEFS[map[id]],52,.9);}
UI.modes=function(){const s=JD.save,L=$('modeList');L.innerHTML='';const today=RNG.today(),dr=s.daily[today];
 const items=[
  ['quick','Quick Rummage','60 seconds on the clock. Every find buys you a few more.',s.best.quick?'Best: '+fmt(s.best.quick):'No score yet'],
  ['cleanout','The Big Cleanout','20 handcrafted drawers that teach you every trick. Up to three stars each.','Stars: '+PG.stars(s)+' / 60'],
  ['bottomless','Bottomless Drawer','It never ends. Each request has its own timer. Three strikes and you\'re out.',s.best.depth?'Deepest: '+s.best.depth+'  ·  Best: '+fmt(s.best.bottomless):'No score yet'],
  ['daily','Daily Drawer','Same drawer, same requests, for everyone today.',dr?'Today: '+fmt(dr.score)+(dr.done?'  ·  finished':''):'Not played today'],
  ['free','Just Fiddling','No clock, no requests. Just the drawer and you.','']];
 for(const it of items){const b=document.createElement('button');b.className='mode';b.id='m_'+it[0];b.appendChild(modeIcon(it[0]));const d=document.createElement('div');d.innerHTML='<b>'+it[1]+'</b><small>'+it[2]+'</small>'+(it[3]?'<em>'+it[3]+'</em>':'');b.appendChild(d);
  b.onclick=()=>{AU.ui();if(it[0]==='cleanout')JD.go('chal');else JD.start(it[0]);};L.appendChild(b);}};
const LOCK='<svg viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3h1.5v11h-13V10zM9.5 10h5V7a2.5 2.5 0 0 0-5 0z"/></svg>';
UI.chal=function(){const s=JD.save,G=$('chalGrid');G.innerHTML='';$('chalStars').textContent='Stars: '+PG.stars(s)+' / 60';let nextSet=false;
 LV.CHALLENGES.forEach((c,i)=>{const rec=s.chal[i],open=JD.chalOpen(i);const b=document.createElement('button');b.className='ch'+(open?'':' lock');b.id='ch_'+i;
  if(open&&!rec&&!nextSet){b.classList.add('next');nextSet=true;}
  const st=rec?rec.stars:0;b.innerHTML='<div class="n">'+(i+1)+'</div><div class="t">'+c.n+'</div>'+(open?'<div class="s">'+'★'.repeat(st)+'<i>'+'★'.repeat(3-st)+'</i></div>':LOCK);
  b.onclick=()=>{if(!open){AU.wrong();UI.toast('Finish challenge '+i+' first.');return;}AU.ui();JD.intro(i);};G.appendChild(b);});};
UI.intro=function(i){const c=LV.CHALLENGES[i],rec=JD.save.chal[i];$('inNum').textContent='No. '+(i+1)+' of 20';$('inName').textContent=c.n;$('inText').textContent=c.i;
 $('inMeta').innerHTML='<span>'+c.reqs.length+' requests</span><span>Time: '+clock(c.time)+'</span><span>★★ under '+clock(c.par)+'</span><span>★★★ also no mistakes</span>'+(rec?'<span>Best: '+'★'.repeat(rec.stars)+' · '+fmt(rec.score)+'</span>':'');};
UI.results=function(r){$('resTitle').textContent=r.title;$('resStars').innerHTML=r.stars==null?'':'★'.repeat(r.stars)+'<i>'+'★'.repeat(3-r.stars)+'</i>';
 $('resScore').textContent=fmt(r.score);$('resBest').textContent=r.newBest?'New best!':(r.best!=null?'Best: '+fmt(r.best):'');
 $('resLines').innerHTML=r.lines.map(l=>'<div><span>'+l[0]+'</span><b>'+l[1]+'</b></div>').join('');
 $('resAch').innerHTML=r.unlocks.map(u=>'<div>'+(u.type==='ach'?'Achievement: <b>'+u.n+'</b>':u.type==='design'?'New drawer: <b>'+u.n+'</b>':'New objects: <b>'+u.n+'</b>')+'</div>').join('');
 const B=$('resBtns');B.innerHTML='';r.buttons.forEach(([t,f,cls,id])=>{const b=document.createElement('button');b.className='btn '+(cls||'');b.textContent=t;if(id)b.id=id;b.onclick=()=>{AU.ui();f();};B.appendChild(b);});};
UI.settings=function(){const s=JD.save.set,L=$('setList');L.innerHTML='';
 [['music','Music'],['sfx','Sound effects'],['haptics','Vibration'],['hints','Gentle hints'],['motion','Wobbly animations']].forEach(([k,n])=>{const d=document.createElement('div');d.className='set';d.innerHTML='<span>'+n+'</span>';const t=document.createElement('button');t.className='tog'+(s[k]?' on':'');t.id='t_'+k;t.setAttribute('aria-label',n);
  t.onclick=()=>{s[k]=!s[k];t.classList.toggle('on',s[k]);JD.applySettings();JD.persist();AU.ui();};d.appendChild(t);L.appendChild(d);});};
UI.ach=function(){const s=JD.save,L=$('achList');L.innerHTML='';const n=PG.ACH.filter(a=>s.ach[a.id]).length;$('achCount').textContent=n+' of '+PG.ACH.length+' earned';
 PG.ACH.forEach((a,i)=>{const d=document.createElement('div');d.className='ach'+(s.ach[a.id]?' got':'');d.innerHTML='<div class="ic">'+(s.ach[a.id]?'✓':i+1)+'</div><div><b>'+a.n+'</b><small>'+a.d+'</small></div>';L.appendChild(d);});};
function designSwatch(D){const c=document.createElement('canvas');c.width=300;c.height=110;const g=c.getContext('2d');g.fillStyle=D.wood;g.fillRect(0,0,300,110);
 for(let i=0;i<30;i++){g.strokeStyle='rgba(60,30,10,.15)';g.beginPath();g.moveTo(0,i*4+Math.sin(i)*2);g.bezierCurveTo(100,i*4+3,200,i*4-3,300,i*4+1);g.stroke();}
 g.fillStyle=D.lc[0];g.fillRect(16,16,268,94);g.fillStyle=D.lc[1];g.globalAlpha=.5;
 if(D.liner==='check')for(let x=16;x<284;x+=24)for(let y=16;y<110;y+=24){g.fillRect(x,y,12,12);}
 else if(D.liner==='news')for(let y=26;y<104;y+=8)g.fillRect(24,y,110+((y*7)%60),3);
 else if(D.liner==='floral')for(let i=0;i<20;i++){g.beginPath();g.arc(20+(i*53)%260,22+(i*31)%84,5,0,7);g.fill();}
 else if(D.liner==='cork'||D.liner==='felt'||D.liner==='velvet')for(let i=0;i<500;i++)g.fillRect(16+Math.random()*268,16+Math.random()*94,2,2);
 g.globalAlpha=1;const grd=g.createLinearGradient(0,16,0,34);grd.addColorStop(0,'rgba(0,0,0,.4)');grd.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=grd;g.fillRect(16,16,268,18);return c;}
UI.unlocks=function(){const s=JD.save,L=$('unlockList');L.innerHTML='';
 const h1=document.createElement('div');h1.className='sec';h1.textContent='Drawers';L.appendChild(h1);const dg=document.createElement('div');dg.className='designs';
 PG.DESIGNS.forEach(D=>{const ok=PG.designOk(s,D.id);const b=document.createElement('button');b.className='design'+(ok?'':' lock')+(s.design===D.id?' on':'');b.id='d_'+D.id;b.appendChild(designSwatch(D));
  const t=document.createElement('div');t.innerHTML=D.n+(ok?'':'<small>'+D.rt+'</small>');b.appendChild(t);
  b.onclick=()=>{if(!ok){AU.wrong();UI.toast(D.rt+' to unlock this one.');return;}s.design=D.id;JD.persist();RD.static=null;RD.dirty=1;AU.drawer();UI.unlocks();};dg.appendChild(b);});L.appendChild(dg);
 const h2=document.createElement('div');h2.className='sec';h2.textContent='Objects';L.appendChild(h2);
 const base=document.createElement('div');base.innerHTML='<div class="collhead"><span>The usual ('+OBJ.base.length+')</span><small>always in the drawer</small></div>';const br=document.createElement('div');br.className='collrow';OBJ.base.forEach(d=>br.appendChild(UI.thumb(d,44,.95)));base.appendChild(br);L.appendChild(base);
 PG.COLLS.forEach(c=>{const ok=c.req(s);const w=document.createElement('div');w.innerHTML='<div class="collhead"><span>'+c.n+'</span><small>'+(ok?'in the drawer now':c.rt)+'</small></div>';const r=document.createElement('div');r.className='collrow'+(ok?'':' lock');OBJ.LIST.filter(d=>d.coll===c.id).forEach(d=>r.appendChild(UI.thumb(d,44,.95)));w.appendChild(r);L.appendChild(w);});
 const h3=document.createElement('div');h3.className='sec';h3.textContent='Oddities';L.appendChild(h3);
 OBJ.rares.forEach(d=>{const got=s.stats.oddities.includes(d.id);const r=document.createElement('div');r.className='odd'+(got?'':' no');r.appendChild(UI.thumb(d,48,.95));const t=document.createElement('div');t.innerHTML=got?'<b>'+d.n+'</b><br>'+d.desc[0]:'Not found yet. They turn up rarely, usually near the bottom.';r.appendChild(t);L.appendChild(r);});};
UI.stats=function(){const s=JD.save,st=s.stats,L=$('statList');const m=Math.floor(st.time/60);
 const rows=[['Rounds played',st.rounds],['Things found',st.found],['Things moved',st.moved],['Wrong picks',st.wrong],['Things broken',st.broken],['Found while buried',st.hidden],['Knots worked loose',st.knots],['Pulled off magnets',st.unstuck],['Lookalikes sorted out',st.decoys],['Described requests solved',st.mystery],['Multi-item requests',st.combos],['Closer looks',st.inspected],['Things put in the tray',st.trayed],['Longest streak',st.bestStreak],['Fastest find',st.fastest<99?st.fastest.toFixed(1)+' s':'-'],['Shed keys found',st.shed+' (still no shed)'],['Oddities found',st.oddities.length+' of 4'],['Quick Rummage best',fmt(s.best.quick)],['Bottomless best',fmt(s.best.bottomless)+' (depth '+s.best.depth+')'],['Daily drawers finished',st.dailies],['Cleanout stars',PG.stars(s)+' of 60'],['Time spent rummaging',m+' min']];
 L.innerHTML=rows.map(r=>'<div class="stat"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');};
UI.confirm=function(title,text,yes){$('cfTitle').textContent=title;$('cfText').textContent=text;const prev=JD.state;JD.go('confirm');$('cfYes').onclick=()=>{AU.ui();yes();};$('cfNo').onclick=()=>{AU.ui();JD.go(prev);};};
window.UI=UI;
})();
