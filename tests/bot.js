// Solver bot used by tests. It only uses moves a player could make: move what's on top, use the tray,
// tug knots, pull things off magnets, then hand the target over.
window.BOT={log:[],
 cands(){const M=JD.M,r=M.req;const i=r.filled.findIndex(f=>!f);const sl=r.slots[i];return WD.objs.filter(o=>!o.gone&&LV.matchSlot(sl,o));},
 farSpot(t){let best=null,bd=-1;for(let k=0;k<14;k++){const x=30+Math.random()*(WD.W-60),y=30+Math.random()*(WD.H-60);const d=Math.hypot(x-t.x,y-t.y);if(d>bd){bd=d;best=[x,y];}}return best;},
 step(){const M=JD.M;if(!M||M.ended)return 'ended';if(M.busy||M.locked||!M.req)return 'wait';
  const c=BOT.cands();if(!c.length)return 'NOTARGET';
  const sc=o=>o.tray>=0?3:(o.mag?0.2:0)+(o.tang?0.1:0)+WD.vis(o);c.sort((a,b)=>sc(b)-sc(a));const t=c[0];
  if(t.tray>=0){JD.tapObj(t);JD.tapObj(t);return 'submit-tray';}
  if(t.tang){JD.knotTap(t.tang);return 'knot';}
  if(t.mag){const mg=t.mag;JD.unstick(t);const p=BOT.farSpot(mg);t.x=p[0];t.y=p[1];WD.raise(t);return 'unstick';}
  const cov=WD.coverers(t);
  if(!cov.length||WD.vis(t)>.5){JD.tapObj(t);if(JD.sel===t)JD.tapObj(t);return 'submit';}
  if(t.d.magnet&&cov.every(q=>q.mag===t)){JD.tapObj(t);if(JD.sel===t)JD.tapObj(t);return 'submit';}
  let m=cov[0];if(m.mag===t){JD.unstick(m);const p=BOT.farSpot(t);m.x=p[0];m.y=p[1];WD.raise(m);return 'unstick';}if(m.mag)m=m.mag;if(m.tang&&m.tang.b===m)m=m.tang.a;
  if(WD.tray.includes(null)&&!m.tang&&!m.d.magnet&&!WD.objs.some(q=>q.mag===m)){if(JD.toTray(m)==='ok')return 'tray';}
  const p=BOT.farSpot(t);const dx=p[0]-m.x,dy=p[1]-m.y;for(const q of WD.group(m)){q.x+=dx;q.y+=dy;}WD.raise(m);return 'move';},
 // run game time forward (no rendering): dt steps of 1/60 s
 run(sec){const n=Math.round(sec*60);for(let i=0;i<n;i++)JD.tick(1/60);},
 // play: one bot action every `pace` seconds of game time, until the round ends or maxSec passes
 play(pace,maxSec){let t=0,acts=0,stuck=0,last='';const seen={};
  while(t<maxSec){if(!JD.M||JD.M.ended)break;if(BOT.god){if(JD.M.time!==null)JD.M.time=1e6;if(JD.M.reqLeft!=null)JD.M.reqLeft=1e6;}const a=BOT.step();if(a==='NOTARGET')return{err:'NOTARGET',req:JD.M.req&&JD.M.req.text,t};
   if(a!=='wait')acts++;seen[a]=(seen[a]||0)+1;BOT.run(a==='wait'?.1:pace);t+=a==='wait'?.1:pace;}
  return{t,acts,seen,ended:!JD.M||JD.M.ended};}};
// a screen point where a tap would land on object o (o must be at least partly visible)
BOT.pt=function(o){const e=SPR.get(o.d),p=e.pts,c=Math.cos(o.r),s=Math.sin(o.r);let best=null,bd=1e9;for(let i=0;i<p.length;i+=2){const x=o.x+p[i]*c-p[i+1]*s,y=o.y+p[i]*s+p[i+1]*c;if(WD.pick(x,y)===o){const d=Math.hypot(p[i],p[i+1]);if(d<bd){bd=d;best=[x,y];}}}return best?RD.toScreen(best[0],best[1]):null;};
BOT.ptUid=uid=>BOT.pt(WD.objs.find(o=>o.uid===uid));
BOT.scene=function(list){JD.save.tut=1;if(!JD.M||JD.M.kind!=='quick'||JD.M.ended)JD.start('quick');JD.M.locked=false;JD.M.time=9999;JD.silent=1;WD.reset();JD.silent=0;JD.select(null);
 const out=list.map(a=>WD.add(OBJ.DEFS[a[0]],a[1],a[2],a[3]||0));JD.M.req=null;JD.M.busy=true;return out;};
BOT.ask=function(spec){const M=JD.M;M.req=LV.makeReq(spec,M.R,M.avail);M.req.vis0=1;M.reqT=1;M.busy=false;UI.note(M.req);return M.req;};
