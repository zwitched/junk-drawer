// Drawing helpers shared by every object illustration. Style: warm board-game illustration,
// dark brown outline, top-left light, one highlight stroke, one shade band.
(function(){
const OUT='#2b1c12';
const A={OUT};
A.rr=function(g,x,y,w,h,r){g.beginPath();A.rrp(g,x,y,w,h,r);};
A.rrp=function(g,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
A.circ=function(g,x,y,r){g.beginPath();g.arc(x,y,r,0,Math.PI*2);};
A.ell=function(g,x,y,rx,ry,rot){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,Math.PI*2);};
A.fs=function(g,fill,lw,rule){g.fillStyle=fill;g.fill(rule||'nonzero');g.lineWidth=lw||1.5;g.strokeStyle=OUT;g.lineJoin='round';g.lineCap='round';g.stroke();};
A.f=function(g,fill,rule){g.fillStyle=fill;g.fill(rule||'nonzero');};
A.st=function(g,col,lw){g.strokeStyle=col;g.lineWidth=lw||1;g.lineCap='round';g.lineJoin='round';g.stroke();};
A.lin=function(g,x0,y0,x1,y1,cols){const gr=g.createLinearGradient(x0,y0,x1,y1);cols.forEach((c,i)=>gr.addColorStop(i/(cols.length-1),c));return gr;};
A.rad=function(g,x,y,r0,r1,cols){const gr=g.createRadialGradient(x,y,r0,x,y,r1);cols.forEach((c,i)=>gr.addColorStop(i/(cols.length-1),c));return gr;};
A.steel=(g,y0,y1)=>A.lin(g,0,y0,0,y1,['#f7f9fb','#c3cad1','#8a939c','#5f676f','#aab2ba']);
A.brass=(g,y0,y1)=>A.lin(g,0,y0,0,y1,['#fff1b8','#e7bb52','#b8862b','#7e5714','#c99a3c']);
A.copper=(g,y0,y1)=>A.lin(g,0,y0,0,y1,['#ffd2b0','#d9814a','#a5552a','#6e3418','#c56c3d']);
A.iron=(g,y0,y1)=>A.lin(g,0,y0,0,y1,['#b9a89a','#8c7867','#6a5646','#4a3a2e','#7a6555']);
A.plastic=(g,y0,y1,c,d)=>A.lin(g,0,y0,0,y1,[A.tint(c,.35),c,c,d||A.tint(c,-.35)]);
A.hl=function(g,x0,y0,x1,y1,a,w){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);A.st(g,'rgba(255,255,255,'+(a||.6)+')',w||1.4);};
A.hlc=function(g,x,y,r,a0,a1,a,w){g.beginPath();g.arc(x,y,r,a0,a1);A.st(g,'rgba(255,255,255,'+(a||.55)+')',w||1.4);};
// darken/lighten hex color by f (-1..1)
A.tint=function(hex,f){let n=parseInt(hex.slice(1),16),r=n>>16,gg=(n>>8)&255,b=n&255;
 if(f>0){r+=(255-r)*f;gg+=(255-gg)*f;b+=(255-b)*f}else{r*=1+f;gg*=1+f;b*=1+f}
 return'#'+((1<<24)|(Math.round(r)<<16)|(Math.round(gg)<<8)|Math.round(b)).toString(16).slice(1);};
// clip to current path, run fn (for inner shading), restore
A.inside=function(g,fn){g.save();g.clip();fn();g.restore();};
A.screwHead=function(g,x,y,r,slotRot){A.circ(g,x,y,r);A.fs(g,A.rad(g,x-r*.3,y-r*.3,0,r,['#ffffff','#c5ccd3','#6d757d']),1.2);
 g.save();g.translate(x,y);g.rotate(slotRot||0);g.beginPath();g.moveTo(-r*.7,0);g.lineTo(r*.7,0);A.st(g,'#3b3f44',1.3);g.restore();};
A.text=function(g,t,x,y,size,col,font,align){g.font=(font||'bold ')+size+'px Georgia, serif';g.fillStyle=col;g.textAlign=align||'center';g.textBaseline='middle';g.fillText(t,x,y);};
window.A=A;
})();
