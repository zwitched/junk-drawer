// The drawer simulation: object instances, stacking, a light custom physics (slides, rolls, wall bounces,
// collision nudges, landing settle), magnets, tangles, fragile breakage, the sorting tray and disasters.
(function(){
const W=312,H=440,TRAY={x:0,y:474,w:312,h:68,n:5};
const WD={W,H,TRAY,objs:[],tray:[null,null,null,null,null],tangles:[],t:0,zc:0,uid:0,listeners:[],held:null};
const P=Math.PI,clamp=(v,a,b)=>v<a?a:v>b?b:v;
function emit(type,a,b){for(const f of WD.listeners)f(type,a,b);}
WD.on=f=>WD.listeners.push(f);
function circles(d){if(d._c)return d._c;const c=[];const L=Math.max(d.w,d.h),S=Math.min(d.w,d.h);const r=Math.max(5,S/2*0.9);
 const n=Math.max(1,Math.round((L-S)/(r*1.2))+1);for(let i=0;i<n;i++){const t=n===1?0:(i/(n-1)-.5)*(L-2*r);d.w>=d.h?c.push(t,0,r):c.push(0,t,r);}
 d._c=c;d._R=Math.hypot(d.w,d.h)/2;return c;}
WD.circles=circles;
WD.reset=function(){WD.objs.length=0;WD.tray.fill(null);WD.tangles.length=0;WD.zc=0;WD.held=null;WD.t=0;};
WD.add=function(def,x,y,r,opt){circles(def);const o={uid:++WD.uid,d:def,x,y,r:r||0,z:++WD.zc,vx:0,vy:0,vr:0,lift:0,tl:0,held:0,tray:-1,broken:0,mag:null,mo:null,tang:null,gone:0,wob:0,wobA:0,immune:0,drop:0,landing:0,tr:null,flash:0,warn:0,seen:0,moved:0};
 if(opt)Object.assign(o,opt);WD.objs.push(o);WD.sort();return o;};
WD.sort=function(){WD.objs.sort((a,b)=>a.z-b.z);};
WD.raise=function(o){const grp=WD.group(o);grp.sort((a,b)=>a.z-b.z);
 // tangled cable stays on top of what it is wrapped around
 for(const m of grp)m.z=++WD.zc;if(o.tang){o.tang.a.z=++WD.zc;}
 for(const m of grp)if(m.d.magnet)for(const q of WD.objs)if(q.mag===m)q.z=++WD.zc;WD.sort();};
WD.lower=function(o){o.z=-(++WD.zc);WD.sort();};
WD.remove=function(o){o.gone=1;if(o.tray>=0){WD.tray[o.tray]=null;o.tray=-1;}if(o.tang)WD.untangle(o.tang,true);
 for(const q of WD.objs)if(q.mag===o){q.mag=null;q.immune=WD.t+.5;}o.mag=null;WD.objs.splice(WD.objs.indexOf(o),1);};
WD.live=function(){return WD.objs.filter(o=>!o.gone&&o.tray<0);};
WD.group=function(o){const g=[o];if(o.tang){const p=o.tang.a===o?o.tang.b:o.tang.a;g.push(p);}
 for(const m of g.slice())if(m.d.magnet)for(const q of WD.objs)if(q.mag===m&&!g.includes(q))g.push(q);return g;};
// local point
function toLocal(o,x,y){const dx=x-o.x,dy=y-o.y,c=Math.cos(o.r),s=Math.sin(o.r);return[dx*c+dy*s,-dx*s+dy*c];}
WD.toLocal=toLocal;
WD.hitObj=function(o,x,y,dil){const d=o.d;if(Math.abs(x-o.x)>d._R+6||Math.abs(y-o.y)>d._R+6)return false;const l=toLocal(o,x,y);return SPR.hit(d,l[0],l[1],dil);};
WD.pick=function(x,y){const L=WD.objs;for(let i=L.length-1;i>=0;i--){const o=L[i];if(o.gone||o.tray>=0||o.drop>0)continue;if(WD.hitObj(o,x,y,false))return o;}
 for(let i=L.length-1;i>=0;i--){const o=L[i];if(o.gone||o.tray>=0||o.drop>0)continue;if(WD.hitObj(o,x,y,true))return o;}return null;};
// touch picking: exact hit first, then a ring of points around the finger so small things on small screens are still easy to grab
WD.pickTouch=function(x,y,r){const o=WD.pick(x,y);if(o||!(r>0))return o;let best=null,bi=-1;
 for(let k=0;k<12;k++){const a=k*Math.PI/6;for(const f of[.55,1]){const px=x+Math.cos(a)*r*f,py=y+Math.sin(a)*r*f;const q=WD.pick(px,py);if(q){const i=WD.objs.indexOf(q);if(i>bi){bi=i;best=q;}}}}return best;};
WD.traySlot=function(x,y){const T=TRAY;if(y<T.y-10||y>T.y+T.h+10||x<T.x-10||x>T.x+T.w+10)return -1;return clamp(Math.floor((x-T.x)/(T.w/T.n)),0,T.n-1);};
WD.slotPos=function(i){return[TRAY.x+(i+.5)*TRAY.w/TRAY.n,TRAY.y+TRAY.h/2];};
WD.inTrayArea=(x,y)=>y>TRAY.y-14&&y<TRAY.y+TRAY.h+30&&x>TRAY.x-20&&x<TRAY.x+TRAY.w+20;
WD.toTray=function(o){if(o.tang)return 'tangled';const i=WD.tray.indexOf(null);if(i<0)return 'full';
 for(const q of WD.objs)if(q.mag===o){q.mag=null;q.immune=WD.t+.6;q.vx=(Math.random()-.5)*120;q.vy=(Math.random()-.5)*120;}
 if(o.mag){o.mag=null;}o.held=0;o.tl=0;o.lift=0;o.tray=i;WD.tray[i]=o;o.vx=o.vy=o.vr=0;o.tr=null;emit('tray',o);return 'ok';};
WD.fromTray=function(o,x,y){if(o.tray<0)return;WD.tray[o.tray]=null;o.tray=-1;o.x=x;o.y=y;WD.raise(o);};
// fraction of an object's visible shape not covered by anything above it
WD.vis=function(o){const e=SPR.get(o.d),p=e.pts,c=Math.cos(o.r),s=Math.sin(o.r);const above=[];
 for(const q of WD.objs){if(q.z<=o.z||q.gone||q.tray>=0||q===o)continue;const R=q.d._R+o.d._R;if(Math.abs(q.x-o.x)<R&&Math.abs(q.y-o.y)<R)above.push(q);}
 if(!above.length)return 1;let free=0,n=p.length/2;
 for(let i=0;i<p.length;i+=2){const wx=o.x+p[i]*c-p[i+1]*s,wy=o.y+p[i]*s+p[i+1]*c;let cov=false;for(const q of above){if(WD.hitObj(q,wx,wy,false)){cov=true;break;}}if(!cov)free++;}
 return free/n;};
WD.coverers=function(o){const e=SPR.get(o.d),p=e.pts,c=Math.cos(o.r),s=Math.sin(o.r),res=new Map();
 for(const q of WD.objs){if(q.z<=o.z||q.gone||q.tray>=0||q===o)continue;let k=0;for(let i=0;i<p.length;i+=2){const wx=o.x+p[i]*c-p[i+1]*s,wy=o.y+p[i]*s+p[i+1]*c;if(WD.hitObj(q,wx,wy,false))k++;}if(k)res.set(q,k);}
 return [...res.entries()].sort((a,b)=>b[1]-a[1]).map(e=>e[0]);};
function wcirc(o,i){const c=o.d._c,ca=Math.cos(o.r),sa=Math.sin(o.r);return[o.x+c[i]*ca-c[i+1]*sa,o.y+c[i]*sa+c[i+1]*ca,c[i+2]];}
function overlap(a,b){if(Math.abs(a.x-b.x)>a.d._R+b.d._R||Math.abs(a.y-b.y)>a.d._R+b.d._R)return null;
 const ca=a.d._c,cb=b.d._c;let best=null;for(let i=0;i<ca.length;i+=3){const p=wcirc(a,i);for(let j=0;j<cb.length;j+=3){const q=wcirc(b,j);const dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy),pen=p[2]+q[2]-d;if(pen>0&&(!best||pen>best[2]))best=[dx/(d||1),dy/(d||1),pen];}}return best;}
WD.overlap=overlap;
function bounds(o){const c=o.d._c;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(let i=0;i<c.length;i+=3){const p=wcirc(o,i);x0=Math.min(x0,p[0]-p[2]);x1=Math.max(x1,p[0]+p[2]);y0=Math.min(y0,p[1]-p[2]);y1=Math.max(y1,p[1]+p[2]);}return[x0,y0,x1,y1];}
WD.bounds=bounds;
const pairCd=new Map();
WD.mass=o=>o.d.wt*(o.d.w*o.d.h)/1500+.5;
function knock(a,b,n,speed){const key=a.uid<b.uid?a.uid*100000+b.uid:b.uid*100000+a.uid;const t=pairCd.get(key);if(t&&t>WD.t)return;pairCd.set(key,WD.t+.25);
 if(b.held||b.mag||b.tray>=0)return;const ma=WD.mass(a),mb=WD.mass(b),k=Math.min(1.2,ma/mb)*.55;const leader=b.tang&&b.tang.b===b?b.tang.a:b;
 leader.vx+=n[0]*speed*k;leader.vy+=n[1]*speed*k;leader.vr+=(Math.random()-.5)*speed*.01*k;a.vx*=.82;a.vy*=.82;b.wob=.25;
 emit('knock',a,b,speed);
 if(b.d.fragile&&!b.broken&&a.d.wt>=2&&speed>520)WD.breakObj(b,'hit');
 if(a.d.fragile&&!a.broken&&b.d.wt>=2&&speed>520)WD.breakObj(a,'hit');}
WD.breakObj=function(o,why){if(o.broken)return;o.broken=1;o.wob=.5;emit('break',o,why);};
WD.release=function(o,vx,vy){o.held=0;o.tl=0;o.landing=1;const sp=Math.hypot(vx,vy),cap=1400;const k=sp>cap?cap/sp:1;
 const leader=o.tang&&o.tang.b===o?o.tang.a:o;leader.vx=vx*k;leader.vy=vy*k;if(leader!==o){o.vx=o.vy=0;}WD.held=null;};
// landing: nudge what is underneath, crack fragile things under heavy ones
function land(o){o.landing=0;const under=[];for(const q of WD.objs){if(q===o||q.gone||q.tray>=0||q.z>o.z||q.mag===o)continue;const ov=overlap(o,q);if(ov)under.push([q,ov]);}
 emit('land',o,under.length);
 for(const [q,ov] of under){
  if(q.d.fragile&&!q.broken&&o.d.wt>=2){const l=toLocal(q,o.x,o.y);let hitCore=SPR.hit(q.d,l[0],l[1],true);
   if(!hitCore){const c=o.d._c;for(let i=0;i<c.length&&!hitCore;i+=3){const p=wcirc(o,i),l2=toLocal(q,p[0],p[1]);hitCore=SPR.hit(q.d,l2[0],l2[1],false);}}
   if(hitCore){WD.breakObj(q,'drop');continue;}}
  if(q.mag||q.held)continue;const push=Math.min(60,22*WD.mass(o)/WD.mass(q));const leader=q.tang&&q.tang.b===q?q.tang.a:q;
  leader.vx+=ov[0]*push;leader.vy+=ov[1]*push;leader.vr+=(Math.random()-.5)*.6;q.wob=.22;}}
WD.untangle=function(t,silent){WD.tangles.splice(WD.tangles.indexOf(t),1);t.a.tang=null;t.b.tang=null;
 if(!silent){const dx=t.b.x-t.a.x,dy=t.b.y-t.a.y,d=Math.hypot(dx,dy)||1;t.a.vx-=dx/d*160;t.a.vy-=dy/d*160;t.b.vx+=dx/d*220;t.b.vy+=dy/d*220;t.a.vr=(Math.random()-.5)*3;t.b.vr=(Math.random()-.5)*3;t.a.wob=t.b.wob=.4;emit('untangle',t.b,t.a);}};
WD.tangle=function(a,b,knots){const t={a,b,k:knots||3,k0:knots||3,off:null,pulse:0};const l=toLocal(a,b.x,b.y);t.off=[l[0],l[1],b.r-a.r];a.tang=t;b.tang=t;WD.tangles.push(t);
 a.vx=a.vy=b.vx=b.vy=0;if(b.z>a.z){const z=a.z;a.z=b.z;b.z=z;WD.sort();}return t;};
WD.knotPos=function(t){return[(t.a.x*.4+t.b.x*.6),(t.a.y*.4+t.b.y*.6)];};
WD.knotAt=function(x,y){for(const t of WD.tangles){const k=WD.knotPos(t);if(Math.hypot(k[0]-x,k[1]-y)<18)return t;}return null;};
WD.tugKnot=function(t){t.k--;t.pulse=.3;t.a.wob=t.b.wob=.2;emit('knot',t);if(t.k<=0)WD.untangle(t);};
function follow(f,lead,off,inv){const c=Math.cos(lead.r),s=Math.sin(lead.r);
 if(!inv){f.x=lead.x+off[0]*c-off[1]*s;f.y=lead.y+off[0]*s+off[1]*c;f.r=lead.r+off[2];}
 else{const r=lead.r-off[2],c2=Math.cos(r),s2=Math.sin(r);f.r=r;f.x=lead.x-(off[0]*c2-off[1]*s2);f.y=lead.y-(off[0]*s2+off[1]*c2);}}
function attach(m,o){const dx=o.x-m.x,dy=o.y-m.y,d=Math.hypot(dx,dy)||1;const body=Math.min(m.d.w,m.d.h)*.42+Math.min(o.d.w,o.d.h)*.45;
 const tx=m.x+dx/d*body,ty=m.y+dy/d*body;const l=toLocal(m,tx,ty);o.mag=m;o.mo=[l[0],l[1],o.r-m.r];o.snap=0;o.sx=o.x;o.sy=o.y;o.vx=o.vy=o.vr=0;o.z=++WD.zc;WD.sort();emit('stick',o,m);}
WD.attach=attach;
WD.stepMagnets=function(){for(const m of WD.objs){if(!m.d.magnet||m.gone||m.tray>=0||m.drop>0)continue;let n=0;for(const q of WD.objs)if(q.mag===m)n++;if(n>=6)continue;
 const R=m.d.magnet;for(const o of WD.objs){if(o===m||!o.d.metal||o.d.magnet||o.gone||o.tray>=0||o.held||o.mag||o.tang||o.immune>WD.t||o.drop>0)continue;
  const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<R+Math.min(o.d.w,o.d.h)*.3){attach(m,o);if(++n>=6)break;}}}};
WD.step=function(dt){WD.t+=dt;const T=WD.t;let moving=0;
 const H1=WD.held;
 for(const o of WD.objs){if(o.gone)continue;
  // lift / drop-in animation
  o.lift+=(o.tl-o.lift)*(1-Math.exp(-dt*(o.tl>o.lift?22:14)));
  if(o.drop>0){o.drop=Math.max(0,o.drop-dt*2.6);if(o.drop===0){o.landing=1;o.lift=.35;}moving++;}
  if(o.landing&&o.lift<.2&&!o.held&&o.drop===0)land(o);
  if(o.wob>0){o.wob=Math.max(0,o.wob-dt);moving++;}if(o.flash>0)o.flash=Math.max(0,o.flash-dt);
  if(o.tr!==null){const d=o.tr-o.r;o.r+=d*(1-Math.exp(-dt*18));if(Math.abs(d)<.002){o.r=o.tr;o.tr=null;}moving++;}
  if(o.tray>=0||o.held||o.mag)continue;
  if(o.tang&&o.tang.b===o)continue;
  const sp=Math.hypot(o.vx,o.vy);
  if(sp>2||Math.abs(o.vr)>.02){moving++;
   o.x+=o.vx*dt;o.y+=o.vy*dt;o.r+=o.vr*dt;
   if(o.d.roll){const ax=Math.cos(o.r),ay=Math.sin(o.r),along=o.vx*ax+o.vy*ay,px=o.vx-along*ax,py=o.vy-along*ay,ka=Math.exp(-dt*5),kp=Math.exp(-dt*1.3);o.vx=along*ka*ax+px*kp;o.vy=along*ka*ay+py*kp;}
   else{const k=Math.exp(-dt*4.6);o.vx*=k;o.vy*=k;}
   o.vr*=Math.exp(-dt*5);if(Math.hypot(o.vx,o.vy)<6){o.vx=o.vy=0;}if(Math.abs(o.vr)<.03)o.vr=0;
   if(sp>70){for(const q of WD.objs){if(q===o||q.gone||q.tray>=0||q.held||q===H1||(o.tang&&(q===o.tang.b))||q.mag===o||q.drop>0)continue;const ov=overlap(o,q);if(ov&&ov[2]>2){const rel=(o.vx*ov[0]+o.vy*ov[1]);if(rel>40)knock(o,q,ov,rel);}}}}
  // walls (soft push back in, bounce if moving out)
  const b=bounds(o);let hit=0;
  if(b[0]<0){o.x+=(-b[0])*Math.min(1,dt*14);if(o.vx<0){hit=Math.max(hit,-o.vx);o.vx=-o.vx*.42;o.vr+=o.vy*.003;}}
  if(b[2]>W){o.x-=(b[2]-W)*Math.min(1,dt*14);if(o.vx>0){hit=Math.max(hit,o.vx);o.vx=-o.vx*.42;o.vr-=o.vy*.003;}}
  if(b[1]<0){o.y+=(-b[1])*Math.min(1,dt*14);if(o.vy<0){hit=Math.max(hit,-o.vy);o.vy=-o.vy*.42;o.vr-=o.vx*.003;}}
  if(b[3]>H){o.y-=(b[3]-H)*Math.min(1,dt*14);if(o.vy>0){hit=Math.max(hit,o.vy);o.vy=-o.vy*.42;o.vr+=o.vx*.003;}}
  if(b[0]<-1||b[2]>W+1||b[1]<-1||b[3]>H+1)moving++;
  if(hit>60){emit('wall',o,hit);if(o.d.fragile&&!o.broken&&hit>760)WD.breakObj(o,'wall');}}
 // constraints: tangles then magnets
 for(const t of WD.tangles){if(t.b.held)follow(t.a,t.b,t.off,true);else follow(t.b,t.a,t.off,false);if(t.pulse>0)t.pulse=Math.max(0,t.pulse-dt);}
 for(const o of WD.objs){if(!o.mag||o.held)continue;const m=o.mag;const c=Math.cos(m.r),s=Math.sin(m.r);const tx=m.x+o.mo[0]*c-o.mo[1]*s,ty=m.y+o.mo[0]*s+o.mo[1]*c;
  if(o.snap<1){o.snap=Math.min(1,o.snap+dt*7);const e=1-Math.pow(1-o.snap,3);o.x=o.sx+(tx-o.sx)*e;o.y=o.sy+(ty-o.sy)*e;moving++;}else{o.x=tx;o.y=ty;}o.r=m.r+o.mo[2];}
 WD.stepMagnets();
 return moving;};
// ---------- disasters ----------
WD.disaster=function(kind,rng){const live=WD.live().filter(o=>!o.held);const R=rng||Math.random;if(!live.length)return null;
 if(kind==='roll'){const c=live.filter(o=>o.d.roll&&!o.mag&&!o.tang);if(!c.length)return null;const o=c[(R()*c.length)|0];const a=o.r+P/2*(R()<.5?1:-1);o.vx=Math.cos(a)*520;o.vy=Math.sin(a)*520;o.wob=.3;WD.raise(o);emit('disaster',kind,o);return o;}
 if(kind==='spring'){const sp=live.find(o=>o.d.id==='spring');if(!sp)return null;sp.vx=(R()-.5)*500;sp.vy=(R()-.5)*500;sp.vr=(R()-.5)*14;let n=0;
  for(const o of live){if(o===sp||o.mag||o.d.wt>1)continue;const dx=o.x-sp.x,dy=o.y-sp.y,d=Math.hypot(dx,dy)||1;if(d<150){const f=(1-d/150)*560+120;const leader=o.tang&&o.tang.b===o?o.tang.a:o;leader.vx+=dx/d*f;leader.vy+=dy/d*f;leader.vr+=(R()-.5)*8;o.wob=.3;n++;}}
  emit('disaster',kind,sp);return sp;}
 if(kind==='snap'){const rb=live.find(o=>o.d.id==='rubber_band');if(!rb)return null;const a=R()*P*2;rb.vx=Math.cos(a)*700;rb.vy=Math.sin(a)*700;rb.vr=(R()-.5)*20;WD.raise(rb);
  for(const o of live){if(o===rb||o.mag)continue;const d=Math.hypot(o.x-rb.x,o.y-rb.y);if(d<90){const leader=o.tang&&o.tang.b===o?o.tang.a:o;leader.vx+=(R()-.5)*260;leader.vy+=(R()-.5)*260;leader.vr+=(R()-.5)*4;o.wob=.3;}}emit('disaster',kind,rb);return rb;}
 if(kind==='slam'){const dir=R()<.5?-1:1;for(const o of live){if(o.mag||(o.tang&&o.tang.b===o))continue;o.vx+=dir*(150+R()*120)/Math.sqrt(o.d.wt);o.vy+=(R()-.5)*90;o.vr+=(R()-.5)*2.5;o.wob=.3;}emit('disaster',kind,null);return true;}
 return null;};
window.WD=WD;
})();
