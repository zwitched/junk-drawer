// Touch / mouse input via Pointer Events: tap to select (tap again to hand over), drag with easing,
// fling, two-finger twist, long-press inspect, knot taps, shake-to-untangle, magnet pull-off, drop on tray or note.
(function(){
const IN={ptrs:new Map(),drag:null,down:null,twist:null,enabled:false};
const TAP_PX=8,LONG_MS=480;
function wpt(e){return RD.toWorld(e.clientX,e.clientY);}
function inNote(e){const n=document.getElementById('note');if(!n||n.offsetParent===null)return false;const r=n.getBoundingClientRect();return e.clientX>=r.left-10&&e.clientX<=r.right+10&&e.clientY>=r.top-10&&e.clientY<=r.bottom+14;}
IN.init=function(cv){
 cv.addEventListener('pointerdown',down,{passive:false});
 window.addEventListener('pointermove',move,{passive:false});
 window.addEventListener('pointerup',up,{passive:false});
 window.addEventListener('pointercancel',cancel,{passive:false});
 cv.addEventListener('lostpointercapture',e=>{if(IN.down&&IN.down.id===e.pointerId&&IN.ptrs.has(e.pointerId))cancel(e);});
 cv.addEventListener('wheel',e=>{if(!IN.enabled)return;e.preventDefault();if(JD.sel)JD.rotateSel(e.deltaY>0?1:-1,Math.PI/12);},{passive:false});
 cv.addEventListener('contextmenu',e=>e.preventDefault());};
function down(e){if(!IN.enabled)return;e.preventDefault();AU.unlock();
 IN.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 try{e.target.setPointerCapture&&e.target.setPointerCapture(e.pointerId);}catch(_){}
 if(IN.ptrs.size===2&&IN.drag){const pts=[...IN.ptrs.values()];IN.twist={a0:Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x),r0:IN.drag.o.r};return;}
 if(IN.ptrs.size>1)return;
 const p=wpt(e);const kt=WD.knotAt(p[0],p[1]);
 let o=null,src='drawer';const si=WD.traySlot(p[0],p[1]);
 if(si>=0&&WD.tray[si]){o=WD.tray[si];src='tray';}else if(p[1]<WD.H+6)o=WD.pickTouch(p[0],p[1],e.pointerType==='mouse'?0:Math.max(0,11/RD.s-5));
 IN.down={id:e.pointerId,o,src,sx:e.clientX,sy:e.clientY,t:performance.now(),p,long:false,knot:kt};
 if(kt){AU.tap('rubber',true);}else if(o){JD.touchObj(o);}}
function startDrag(d,e){const o=d.o;if(!o)return;const p=wpt(e);
 if(d.src==='tray'){WD.fromTray(o,p[0],p[1]);}
 const lead=o.tang&&o.tang.b===o?o:o;WD.raise(lead);o.held=1;o.tl=1;WD.held=o;o.vx=o.vy=0;o.landing=0;o.tr=null;
 const gl=WD.toLocal(o,d.src==='tray'?o.x:d.p[0],d.src==='tray'?o.y:d.p[1]);
 IN.drag={o,gl,fx:p[0],fy:p[1],hist:[[performance.now(),p[0],p[1]]],pull:!!o.mag,ax:o.x,ay:o.y,start:p,rev:0,lastDir:null,shakeT:0};
 JD.dragStart(o);}
function move(e){if(!IN.ptrs.has(e.pointerId))return;e.preventDefault();IN.ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(IN.twist&&IN.drag&&IN.ptrs.size>=2){const pts=[...IN.ptrs.values()];const a=Math.atan2(pts[1].y-pts[0].y,pts[1].x-pts[0].x);JD.setRot(IN.drag.o,IN.twist.r0+(a-IN.twist.a0));return;}
 const d=IN.down;if(!d||d.id!==e.pointerId)return;
 if(!IN.drag){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>TAP_PX&&d.o&&!d.long){startDrag(d,e);}else return;}
 const dr=IN.drag;if(!dr)return;const p=wpt(e);dr.fx=p[0];dr.fy=p[1];const now=performance.now();dr.hist.push([now,p[0],p[1]]);while(dr.hist.length>8)dr.hist.shift();
 // shake detection (direction reversals at speed) works knots loose
 if(dr.o.tang&&dr.hist.length>=2){const a=dr.hist[dr.hist.length-2],b=dr.hist[dr.hist.length-1],dt=(b[0]-a[0])/1000||.016,vx=(b[1]-a[1])/dt,vy=(b[2]-a[2])/dt,sp=Math.hypot(vx,vy);
  if(sp>260){const dir=[vx/sp,vy/sp];if(dr.lastDir&&dir[0]*dr.lastDir[0]+dir[1]*dr.lastDir[1]<-.3){dr.rev++;if(now-dr.shakeT>200){dr.shakeT=now;JD.knotTap(dr.o.tang,true);}}dr.lastDir=dir;}}}
function vel(dr){const h=dr.hist,now=performance.now();if(h.length<2)return[0,0];const b=h[h.length-1];if(now-b[0]>110)return[0,0];let i=h.length-2;while(i>0&&b[0]-h[i-1][0]<100)i--;const a=h[i];const dt=(b[0]-a[0])/1000;if(dt<.008)return[0,0];return[(b[1]-a[1])/dt,(b[2]-a[2])/dt];}
function up(e){if(!IN.ptrs.has(e.pointerId))return;e.preventDefault();IN.ptrs.delete(e.pointerId);
 if(IN.twist){if(IN.ptrs.size<2)IN.twist=null;if(IN.drag&&IN.down&&IN.down.id!==e.pointerId)return;}
 const d=IN.down;if(!d||d.id!==e.pointerId)return;IN.down=null;
 if(IN.drag){const dr=IN.drag,o=dr.o;IN.drag=null;if(!o.held)return;let v=vel(dr);
  if(inNote(e)){o.held=0;o.tl=0;WD.held=null;JD.dropOnNote(o);return;}
  const p=wpt(e);if(WD.inTrayArea(p[0],p[1])&&p[1]>WD.H+10){const r=JD.toTray(o);if(r==='ok')return;}
  WD.release(o,v[0],v[1]);JD.dragEnd(o,Math.hypot(v[0],v[1]));return;}
 if(d.long)return;
 if(d.knot){JD.knotTap(d.knot);return;}
 if(performance.now()-d.t<LONG_MS){if(d.o)JD.tapObj(d.o);else JD.tapEmpty();}}
function cancel(e){IN.ptrs.delete(e.pointerId);IN.twist=null;const d=IN.down;if(d&&d.id===e.pointerId){IN.down=null;if(IN.drag){const o=IN.drag.o;IN.drag=null;if(o.held){WD.release(o,0,0);JD.dragEnd(o,0);}}}}
IN.cancelAll=function(){for(const id of [...IN.ptrs.keys()])cancel({pointerId:id});IN.ptrs.clear();};
// per-frame: ease held object toward the finger; long-press check
IN.update=function(dt){const d=IN.down;
 if(d&&!IN.drag&&!d.long&&d.o&&performance.now()-d.t>LONG_MS){d.long=true;JD.inspect(d.o);}
 const dr=IN.drag;if(!dr)return;const o=dr.o;if(!o.held){IN.drag=null;return;}
 const c=Math.cos(o.r),s=Math.sin(o.r);let tx=dr.fx-(dr.gl[0]*c-dr.gl[1]*s),ty=dr.fy-(dr.gl[0]*s+dr.gl[1]*c);
 if(dr.pull&&o.mag){const dx=dr.fx-dr.start[0],dy=dr.fy-dr.start[1],dd=Math.hypot(dx,dy);
  if(dd<40){const m=o.mag,mc=Math.cos(m.r),ms=Math.sin(m.r);const bx=m.x+o.mo[0]*mc-o.mo[1]*ms,by=m.y+o.mo[0]*ms+o.mo[1]*mc;tx=bx+dx*.28;ty=by+dy*.28;o.wob=.06;}
  else{JD.unstick(o);dr.pull=false;}}
 const k=1-Math.exp(-dt*32);const nx=o.x+(tx-o.x)*k,ny=o.y+(ty-o.y)*k;o.vx=(nx-o.x)/Math.max(dt,.001);o.vy=(ny-o.y)/Math.max(dt,.001);o.x=nx;o.y=ny;
 // keep within the play area so nothing gets lost off-screen
 o.x=Math.max(-10,Math.min(WD.W+10,o.x));o.y=Math.max(-60,Math.min(WD.TRAY.y+WD.TRAY.h,o.y));};
window.IN=IN;
})();
