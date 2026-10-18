// Canvas rendering: the drawer (cached static layer), objects with lifting shadows, glows, knots, tray, and light FX.
(function(){
const RD={cv:null,g:null,s:1,ox:0,oy:0,dpr:1,fx:[],flights:[],static:null,designId:null,cw:0,ch:0};
const VX0=-22,VY0=-24,VW=WD.W+44,VH=WD.TRAY.y+WD.TRAY.h+12+24; // world view box (drawer + front panel + tray)
RD.VW=VW;RD.VH=VH;
RD.init=function(cv){RD.cv=cv;RD.g=cv.getContext('2d');};
RD.resize=function(region){const cv=RD.cv,dpr=Math.min(2,window.devicePixelRatio||1);RD.dpr=dpr;const w=innerWidth,h=innerHeight;
 if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}cv.style.width=w+'px';cv.style.height=h+'px';
 const s=Math.min(region.w/VW,region.h/VH);RD.s=s;RD.ox=region.x+(region.w-VW*s)/2-VX0*s;RD.oy=region.y+(region.h-VH*s)/2-VY0*s;RD.region=region;
 SPR.setScale(s*dpr);RD.static=null;RD.dirty=1;};
RD.toWorld=(sx,sy)=>[(sx-RD.ox)/RD.s,(sy-RD.oy)/RD.s];
RD.toScreen=(wx,wy)=>[RD.ox+wx*RD.s,RD.oy+wy*RD.s];
// ---------- drawer art ----------
function grain(g,x,y,w,h,base,dark,seed,vertical){const r=RNG.make(seed);g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle=base;g.fillRect(x,y,w,h);
 const L=vertical?w:h,S=vertical?h:w;
 for(let i=0;i<L/2.2;i++){const p=r()*L,a=.05+r()*.12;g.strokeStyle=r()<.5?'rgba(60,30,10,'+a+')':'rgba(255,230,190,'+a*.6+')';g.lineWidth=.6+r()*1.6;g.beginPath();
  for(let t=0;t<=S;t+=8){const off=p+Math.sin(t*.018+i)*3+Math.sin(t*.05+i*2)*1.2;vertical?g.lineTo(x+off,y+t):g.lineTo(x+t,y+off);}g.stroke();}
 for(let k=0;k<2;k++){if(r()<.6){const kx=x+r()*w,ky=y+r()*h;for(let j=5;j>0;j--){g.strokeStyle='rgba(70,35,12,'+(.1+j*.03)+')';g.lineWidth=1;g.beginPath();g.ellipse(kx,ky,j*(vertical?2:4),j*(vertical?4:2),0,0,Math.PI*2);g.stroke();}}}
 g.restore();}
function liner(g,D,x,y,w,h){const t=D.liner,c=D.lc;g.save();g.beginPath();g.rect(x,y,w,h);g.clip();g.fillStyle=c[0];g.fillRect(x,y,w,h);const r=RNG.make(7);
 if(t==='check'){g.fillStyle=c[1];g.globalAlpha=.35;const q=22;for(let i=0;i<w/q+1;i++){g.fillRect(x+i*q,y,q/2,h);}for(let j=0;j<h/q+1;j++){g.fillRect(x,y+j*q,w,q/2);}g.globalAlpha=1;}
 else if(t==='felt'){for(let i=0;i<4000;i++){g.fillStyle=r()<.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.05)';g.fillRect(x+r()*w,y+r()*h,1.2,1.2);}}
 else if(t==='news'){g.fillStyle='rgba(60,55,45,.22)';for(let col=0;col<4;col++){const cx=x+8+col*(w-8)/4;for(let ly=y+10;ly<y+h-6;ly+=5.5){if(r()<.07){ly+=10;continue;}g.fillRect(cx,ly,(w-8)/4-12-r()*8,2);}}g.fillStyle='rgba(40,35,30,.4)';g.fillRect(x+10,y+30,w*.45,9);g.fillRect(x+w*.5,y+200,w*.4,9);}
 else if(t==='floral'){for(let i=0;i<70;i++){const fx=x+r()*w,fy=y+r()*h;g.fillStyle=r()<.5?c[1]:'#8fb57a';for(let p=0;p<5;p++){const a=p*1.256;g.beginPath();g.arc(fx+Math.cos(a)*3.4,fy+Math.sin(a)*3.4,2.4,0,7);g.fill();}g.fillStyle='#f2d36b';g.beginPath();g.arc(fx,fy,1.8,0,7);g.fill();}}
 else if(t==='cork'){g.fillStyle=c[0];g.fillRect(x,y,w,h);for(let i=0;i<5000;i++){g.fillStyle=r()<.5?'rgba(90,50,20,.25)':'rgba(255,220,170,.2)';g.fillRect(x+r()*w,y+r()*h,1+r()*1.6,1+r()*1.6);}}
 else if(t==='velvet'){const gr=g.createLinearGradient(x,y,x+w,y+h);gr.addColorStop(0,c[0]);gr.addColorStop(.5,A.tint(c[0],.08));gr.addColorStop(1,c[1]);g.fillStyle=gr;g.fillRect(x,y,w,h);for(let i=0;i<3000;i++){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(x+r()*w,y+r()*h,1,1);}}
 // crumbs and dust
 for(let i=0;i<40;i++){g.fillStyle='rgba(80,60,40,'+(.1+r()*.15)+')';g.beginPath();g.arc(x+r()*w,y+r()*h,.6+r()*1.2,0,7);g.fill();}
 g.restore();}
function buildStatic(D){const s=RD.s*RD.dpr,c=SPR.mk(VW*s,VH*s),g=c.getContext('2d');g.scale(s,s);g.translate(-VX0,-VY0);const W=WD.W,H=WD.H,F=18,T=WD.TRAY;
 // drop shadow of the whole drawer
 g.save();g.shadowColor='rgba(20,10,4,.55)';g.shadowBlur=16*s;g.shadowOffsetY=6*s;g.fillStyle=D.dark;g.fillRect(-F,-F,W+2*F,H+2*F+6);g.restore();
 // side + back walls (top edges), then front panel thicker
 grain(g,-F,-F,W+2*F,F,D.wood,D.dark,11,false);grain(g,-F,H,W+2*F,F+8,D.wood,D.dark,12,false);grain(g,-F,0,F,H,D.wood,D.dark,13,true);grain(g,W,0,F,H,D.wood,D.dark,14,true);
 g.strokeStyle='rgba(40,20,8,.6)';g.lineWidth=1.2;g.strokeRect(-F+.5,-F+.5,W+2*F-1,H+2*F+8-1);
 // mitred corners
 g.beginPath();g.moveTo(-F,-F);g.lineTo(0,0);g.moveTo(W+F,-F);g.lineTo(W,0);g.moveTo(-F,H+F+8);g.lineTo(0,H);g.moveTo(W+F,H+F+8);g.lineTo(W,H);g.strokeStyle='rgba(40,20,8,.35)';g.stroke();
 g.fillStyle='rgba(255,240,210,.18)';g.fillRect(-F,-F,W+2*F,2);
 liner(g,D,0,0,W,H);
 // inner walls shading (depth)
 let gr=g.createLinearGradient(0,0,0,26);gr.addColorStop(0,'rgba(30,15,5,.55)');gr.addColorStop(1,'rgba(30,15,5,0)');g.fillStyle=gr;g.fillRect(0,0,W,26);
 gr=g.createLinearGradient(0,0,18,0);gr.addColorStop(0,'rgba(30,15,5,.4)');gr.addColorStop(1,'rgba(30,15,5,0)');g.fillStyle=gr;g.fillRect(0,0,18,H);
 gr=g.createLinearGradient(W,0,W-14,0);gr.addColorStop(0,'rgba(30,15,5,.3)');gr.addColorStop(1,'rgba(30,15,5,0)');g.fillStyle=gr;g.fillRect(W-14,0,14,H);
 gr=g.createLinearGradient(0,H,0,H-10);gr.addColorStop(0,'rgba(30,15,5,.25)');gr.addColorStop(1,'rgba(30,15,5,0)');g.fillStyle=gr;g.fillRect(0,H-10,W,10);
 g.strokeStyle='rgba(30,15,5,.5)';g.lineWidth=1;g.strokeRect(0,0,W,H);
 // brass pull on the front panel
 const hx=W/2;g.fillStyle='rgba(20,10,4,.35)';A.rr(g,hx-34,H+8,68,16,7);g.fill();
 A.rr(g,hx-32,H+5,64,14,7);A.fs(g,A.brass(g,H+5,H+19),1.2);A.hl(g,hx-24,H+8,hx+24,H+8,.7,1.5);
 [hx-38,hx+38].forEach(x=>{A.circ(g,x,H+12,3.2);A.fs(g,A.brass(g,H+9,H+15),1);});
 // sorting tray: small open box with slots
 const tx=T.x,ty=T.y,tw=T.w,th=T.h,f=7;
 g.save();g.shadowColor='rgba(20,10,4,.5)';g.shadowBlur=10;g.shadowOffsetY=4;g.fillStyle=D.dark;g.fillRect(tx-f,ty-f,tw+2*f,th+2*f);g.restore();
 grain(g,tx-f,ty-f,tw+2*f,th+2*f,A.tint(D.wood,.08),D.dark,21,false);
 g.fillStyle='#e9dcc0';g.fillRect(tx,ty,tw,th);for(let i=0;i<900;i++){g.fillStyle='rgba(120,90,50,.08)';g.fillRect(tx+Math.random()*tw,ty+Math.random()*th,1,1);}
 gr=g.createLinearGradient(0,ty,0,ty+12);gr.addColorStop(0,'rgba(30,15,5,.4)');gr.addColorStop(1,'rgba(30,15,5,0)');g.fillStyle=gr;g.fillRect(tx,ty,tw,12);
 for(let i=1;i<T.n;i++){const x=tx+i*tw/T.n;g.fillStyle=D.dark;g.fillRect(x-2,ty,4,th);g.fillStyle='rgba(255,240,210,.25)';g.fillRect(x-2,ty,1,th);}
 g.strokeStyle='rgba(30,15,5,.6)';g.lineWidth=1;g.strokeRect(tx,ty,tw,th);
 return c;}
RD.design=function(){return PG.DESIGNS.find(d=>d.id===(JD.save&&JD.save.design))||PG.DESIGNS[0];};
// glow silhouette per def (cream / red / gold), built lazily
const glowCache={};
function glow(def,col){const k=def.id+col+SPR.scale;if(glowCache[k])return glowCache[k];const e=SPR.get(def),s=SPR.scale,c=SPR.mk(e.W*s,e.H*s),g=c.getContext('2d');
 const off=4000;g.shadowColor=col;g.shadowBlur=5*s;g.shadowOffsetX=off;for(let i=0;i<3;i++)g.drawImage(e.cv,-off,0);return glowCache[k]=c;}
function drawObj(g,o,t,sel){const e=SPR.get(o.d),s=RD.s;const lift=o.lift,sc=1+lift*.07+(o.drop>0?o.drop*.5:0);
 let r=o.r;if(o.wob>0)r+=Math.sin(t*46)*o.wob*.18;if(o.held)r+=Math.max(-.12,Math.min(.12,(o.vx||0)*.00012));
 const x=RD.ox+o.x*s,y=RD.oy+(o.y-(o.drop>0?o.drop*60:0))*s;const w=e.W*s*sc,h=e.H*s*sc;
 const sh=1.6+lift*9+(o.drop>0?o.drop*20:0);
 g.save();g.translate(x+sh*s*.7,y+sh*s);g.rotate(r);g.globalAlpha=.42-lift*.14-(o.drop>0?o.drop*.2:0);g.drawImage(e.sh,-w/2,-h/2,w,h);g.restore();
 g.save();g.translate(x,y);g.rotate(r);
 if(sel||o.hint>0||o.warn>0){const col=o.warn>0?'rgba(220,60,40,1)':sel?'rgba(255,248,215,1)':'rgba(255,214,90,1)';g.globalAlpha=o.warn>0?.9:sel?.95:Math.min(1,o.hint)*(.55+.45*Math.sin(t*6));g.drawImage(glow(o.d,col),-w/2,-h/2,w,h);g.globalAlpha=1;}
 g.drawImage(e.cv,-w/2,-h/2,w,h);if(o.broken)g.drawImage(SPR.crack(o.d),-w/2,-h/2,w,h);
 if(o.flash>0){g.globalAlpha=o.flash*1.6;g.globalCompositeOperation='lighter';g.drawImage(glow(o.d,'rgba(255,240,200,1)'),-w/2,-h/2,w,h);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
 g.restore();}
function drawKnot(g,tg,t){const k=WD.knotPos(tg),[x,y]=RD.toScreen(k[0],k[1]),s=RD.s,p=1+tg.pulse*1.2;
 g.save();g.translate(x,y);g.scale(s*p,s*p);
 g.beginPath();g.arc(0,0,15+Math.sin(t*4)*1.5,0,7);g.strokeStyle='rgba(255,250,235,.85)';g.setLineDash([3,3]);g.lineWidth=1.6;g.lineDashOffset=-t*8;g.stroke();g.setLineDash([]);
 const knot=()=>{g.beginPath();g.moveTo(-9,4);g.bezierCurveTo(-4,-12,6,-8,3,0);g.bezierCurveTo(0,8,-8,2,0,-5);g.bezierCurveTo(6,-10,12,2,9,6);};
 knot();g.strokeStyle=A.OUT;g.lineWidth=5.4;g.lineCap='round';g.stroke();knot();g.strokeStyle='#f4f2ee';g.lineWidth=3.2;g.stroke();
 for(let i=0;i<tg.k0;i++){g.beginPath();g.arc(-6+i*6-(tg.k0-3)*3,13,2.2,0,7);g.fillStyle=i<tg.k?'#e9b62c':'rgba(255,255,255,.35)';g.fill();g.strokeStyle=A.OUT;g.lineWidth=1;g.stroke();}
 g.restore();}
RD.flight=function(o,tx,ty){RD.flights.push({d:o.d,broken:o.broken,x:o.x,y:o.y,r:o.r,t:0,tx,ty});};
RD.pop=function(wx,wy,text,col,big){RD.fx.push({k:'txt',x:wx,y:wy,t:0,text,col:col||'#2b1c12',big:big||0});};
RD.burst=function(wx,wy){RD.fx.push({k:'burst',x:wx,y:wy,t:0,a:Math.random()*6});};
RD.render=function(t,dt){const g=RD.g,cv=RD.cv,dpr=RD.dpr;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(dpr,0,0,dpr,0,0);
 const D=RD.design();if(!RD.static||RD.designId!==D.id){RD.static=buildStatic(D);RD.designId=D.id;}
 g.drawImage(RD.static,RD.ox+VX0*RD.s,RD.oy+VY0*RD.s,VW*RD.s,VH*RD.s);
 const sel=JD.sel;const L=WD.objs;
 // drawer objects clipped to the drawer interior (except held / dropping ones)
 g.save();g.beginPath();g.rect(RD.ox-2,RD.oy-2,WD.W*RD.s+4,WD.H*RD.s+4);g.clip();
 for(const o of L){if(o.gone||o.tray>=0||o.held||o.drop>0||o.lift>.3)continue;drawObj(g,o,t,o===sel);}
 g.restore();
 for(const tg of WD.tangles)drawKnot(g,tg,t);
 // tray items
 for(let i=0;i<WD.tray.length;i++){const o=WD.tray[i];if(!o||o.held)continue;const p=WD.slotPos(i),e=SPR.get(o.d),k=Math.min(1,52/Math.max(o.d.w,o.d.h));
  const [x,y]=RD.toScreen(p[0],p[1]);g.save();g.translate(x+2*RD.s,y+3*RD.s);g.rotate(-.3);g.globalAlpha=.35;g.drawImage(e.sh,-e.W*RD.s*k/2,-e.H*RD.s*k/2,e.W*RD.s*k,e.H*RD.s*k);g.restore();
  g.save();g.translate(x,y);g.rotate(-.3);if(o===sel){g.drawImage(glow(o.d,'rgba(255,248,215,1)'),-e.W*RD.s*k/2,-e.H*RD.s*k/2,e.W*RD.s*k,e.H*RD.s*k);}g.drawImage(e.cv,-e.W*RD.s*k/2,-e.H*RD.s*k/2,e.W*RD.s*k,e.H*RD.s*k);if(o.broken)g.drawImage(SPR.crack(o.d),-e.W*RD.s*k/2,-e.H*RD.s*k/2,e.W*RD.s*k,e.H*RD.s*k);g.restore();}
 // lifted, held and falling objects on top
 for(const o of L){if(o.gone||o.tray>=0)continue;if(o.held||o.drop>0||o.lift>.3)drawObj(g,o,t,o===sel);}
 // flights to the request note
 for(let i=RD.flights.length-1;i>=0;i--){const f=RD.flights[i];f.t+=dt*2.2;if(f.t>=1){RD.flights.splice(i,1);continue;}const e=SPR.get(f.d),k=f.t*f.t*(3-2*f.t);
  const [x0,y0]=RD.toScreen(f.x,f.y);const x=x0+(f.tx-x0)*k,y=y0+(f.ty-y0)*k-Math.sin(k*Math.PI)*60;const sc=(1+Math.sin(k*Math.PI)*.35)*(1-k*.6)*RD.s;
  g.save();g.translate(x,y);g.rotate(f.r+k*2.2);g.globalAlpha=1-Math.max(0,k-.8)*5;g.drawImage(e.cv,-e.W*sc/2,-e.H*sc/2,e.W*sc,e.H*sc);g.restore();}
 // fx
 for(let i=RD.fx.length-1;i>=0;i--){const f=RD.fx[i];f.t+=dt;const [x,y]=RD.toScreen(f.x,f.y);
  if(f.k==='txt'){const life=f.big?1.4:1.0;if(f.t>life){RD.fx.splice(i,1);continue;}const k=f.t/life,yy=y-k*40*RD.s,sz=(f.big?22:16)*RD.s*(f.t<.12?.6+f.t*3.4:1);
   g.save();g.globalAlpha=k>.7?(1-k)/.3:1;g.font='bold '+sz+'px '+JD.FONT;g.textAlign='center';g.textBaseline='middle';g.lineWidth=4*RD.s;g.strokeStyle='rgba(255,250,236,.95)';g.lineJoin='round';g.strokeText(f.text,x,yy);g.fillStyle=f.col;g.fillText(f.text,x,yy);g.restore();}
  else if(f.k==='burst'){if(f.t>.45){RD.fx.splice(i,1);continue;}const k=f.t/.45;g.save();g.strokeStyle='rgba(60,40,20,'+(1-k)+')';g.lineWidth=2.2*RD.s;g.lineCap='round';
   for(let j=0;j<7;j++){const a=f.a+j*Math.PI*2/7,r0=(14+k*22)*RD.s,r1=r0+(8-k*6)*RD.s;g.beginPath();g.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);g.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);g.stroke();}g.restore();}}
 // tutorial pointer
 if(JD.pointer){const p=JD.pointer;const [x,y]=RD.toScreen(p.x,p.y);const b=Math.sin(t*5)*6;g.save();g.translate(x,y-26*RD.s-b);g.scale(RD.s,RD.s);
  g.beginPath();g.moveTo(0,14);g.lineTo(-10,0);g.lineTo(-4,0);g.lineTo(-4,-16);g.lineTo(4,-16);g.lineTo(4,0);g.lineTo(10,0);g.closePath();g.fillStyle='#fff6dc';g.fill();g.strokeStyle=A.OUT;g.lineWidth=2;g.lineJoin='round';g.stroke();g.restore();}
};
RD.busy=()=>RD.fx.length||RD.flights.length;
window.RD=RD;
})();
