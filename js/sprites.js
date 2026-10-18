// Sprite cache: renders each object type once to offscreen canvases (art, soft shadow, crack overlay)
// and builds a 1-unit alpha mask (+ dilated mask for forgiving touch) used for hit tests and visibility.
(function(){
const PAD=8,SPR={PAD,cache:{},scale:0};
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c;}
SPR.mk=mk;
function buildMask(def){
 const W=Math.ceil(def.w+PAD*2),H=Math.ceil(def.h+PAD*2),c=mk(W,H),g=c.getContext('2d');
 g.translate(W/2,H/2);def.draw(g);
 const d=g.getImageData(0,0,W,H).data,m=new Uint8Array(W*H);
 for(let i=0;i<W*H;i++)m[i]=d[i*4+3]>70?1:0;
 // dilate by 5 units for forgiving touch (thin things like pencils and paperclips)
 const R=5,md=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!m[y*W+x])continue;for(let dy=-R;dy<=R;dy++){const yy=y+dy;if(yy<0||yy>=H)continue;for(let dx=-R;dx<=R;dx++){const xx=x+dx;if(xx<0||xx>=W||dx*dx+dy*dy>R*R)continue;md[yy*W+xx]=1;}}}
 // sample points (local coords) on the visible shape, for visibility estimates
 const pts=[];let area=0;for(let i=0;i<W*H;i++)area+=m[i];
 const step=Math.max(2,Math.sqrt(area/44));
 for(let y=step/2;y<H;y+=step)for(let x=step/2;x<W;x+=step){if(m[(y|0)*W+(x|0)])pts.push(x-W/2,y-H/2);}
 if(!pts.length)pts.push(0,0);
 return {W,H,m,md,pts:new Float32Array(pts),area};}
function crack(def,W,H,s){
 const c=mk(W*s,H*s),g=c.getContext('2d');g.scale(s,s);g.translate(W/2,H/2);
 let seed=def.id.length*97;const r=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=1.1;g.lineCap='round';
 for(let k=0;k<6;k++){g.beginPath();let x=(r()-.5)*def.w*.2,y=(r()-.5)*def.h*.2;g.moveTo(x,y);const a=r()*Math.PI*2;for(let i=0;i<4;i++){x+=Math.cos(a+(r()-.5)*1.2)*def.w*.1;y+=Math.sin(a+(r()-.5)*1.2)*def.h*.12;g.lineTo(x,y);}g.stroke();}
 g.strokeStyle='rgba(40,30,25,.6)';g.lineWidth=.6;g.translate(.6,.6);seed=def.id.length*97;
 for(let k=0;k<6;k++){g.beginPath();let x=(r()-.5)*def.w*.2,y=(r()-.5)*def.h*.2;g.moveTo(x,y);const a=r()*Math.PI*2;for(let i=0;i<4;i++){x+=Math.cos(a+(r()-.5)*1.2)*def.w*.1;y+=Math.sin(a+(r()-.5)*1.2)*def.h*.12;g.lineTo(x,y);}g.stroke();}
 // keep cracks on the object only
 g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='destination-in';g.scale(s,s);g.translate(W/2,H/2);def.draw(g);
 return c;}
SPR.get=function(def){let e=SPR.cache[def.id];if(!e){e=SPR.cache[def.id]=buildMask(def);}
 if(e.s!==SPR.scale){const s=SPR.scale,W=e.W,H=e.H;
  const c=mk(W*s,H*s),g=c.getContext('2d');g.scale(s,s);g.translate(W/2,H/2);def.draw(g);e.cv=c;
  const sh=mk(W*s,H*s),h=sh.getContext('2d');const off=4000;h.shadowColor='rgba(38,20,6,1)';h.shadowBlur=3.5*s;h.shadowOffsetX=off;h.drawImage(c,-off,0);e.sh=sh;
  e.cr=null;e.s=s;}
 return e;};
SPR.crack=function(def){const e=SPR.get(def);if(!e.cr)e.cr=crack(def,e.W,e.H,SPR.scale);return e.cr;};
SPR.setScale=function(s){s=Math.round(s*4)/4;if(s!==SPR.scale){SPR.scale=s;}};
// local point inside mask?
SPR.hit=function(def,lx,ly,dil){const e=SPR.cache[def.id]||SPR.get(def);const x=(lx+e.W/2)|0,y=(ly+e.H/2)|0;if(x<0||y<0||x>=e.W||y>=e.H)return false;return (dil?e.md:e.m)[y*e.W+x]===1;};
SPR.warm=function(defs){defs.forEach(d=>SPR.get(d));};
window.SPR=SPR;
})();
