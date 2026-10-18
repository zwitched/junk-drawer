# Performance: cost of one physics tick and one full render with a crowded drawer (54 objects, magnet, tangle),
# plus real frame pacing in headless Chromium with and without 4x CPU throttling (rough stand-in for a mid phone).
from util import *
async def main():
  t=T('perf')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p);E=pg.evaluate
    await E("JD.save.tut=1;JD.start('free')");await pg.wait_for_timeout(900)
    n=await E("(()=>{let k=0;while(WD.live().length<54&&k++<200)LV.toss(JD.M.R.pick(JD.M.avail),JD.M.R);return WD.live().length})()")
    t.chk('crowded drawer built',n>=50,n)
    r=await E("""(()=>{JD.frozen=true;const T=[],R=[];for(let i=0;i<600;i++){const a=performance.now();JD.tick(1/60);T.push(performance.now()-a);}
     for(let i=0;i<200;i++){const a=performance.now();RD.render(i/60,1/60);R.push(performance.now()-a);}JD.frozen=false;
     const st=A=>{A.sort((x,y)=>x-y);return {avg:+(A.reduce((s,x)=>s+x,0)/A.length).toFixed(3),p95:+A[Math.floor(A.length*.95)].toFixed(3),max:+A[A.length-1].toFixed(3)}};return {tick:st(T),render:st(R)}})()""")
    t.chk('physics tick averages under 2 ms with ~54 objects',r['tick']['avg']<2,r['tick'])
    t.chk('full render averages under 8 ms',r['render']['avg']<8,r['render'])
    FPS="""new Promise(res=>{let n=0,t0=performance.now(),worst=0,prev=t0;const m=WD.live().filter(o=>!o.d.magnet)[0];
      function f(now){n++;worst=Math.max(worst,now-prev);prev=now;m.x=156+Math.sin(now/200)*90;m.y=220+Math.cos(now/260)*120;m.held=1;WD.held=m;if(now-t0<3000)requestAnimationFrame(f);else{m.held=0;WD.held=null;res({fps:+(n*1000/(now-t0)).toFixed(1),worst:+worst.toFixed(1)});}}requestAnimationFrame(f);})"""
    f1=await E(FPS);t.chk('headless frame rate while dragging through the pile >= 50 fps',f1['fps']>=50,f1)
    cdp=await c.new_cdp_session(pg);await cdp.send('Emulation.setCPUThrottlingRate',{'rate':4})
    f2=await E(FPS)
    w=await E("""(()=>{JD.frozen=true;let a=performance.now();for(let i=0;i<120;i++){JD.tick(1/60);RD.render(i/60,1/60);}const ms=(performance.now()-a)/120;JD.frozen=false;return +ms.toFixed(2)})()""")
    t.chk('with 4x CPU throttle, game JS per frame (tick + render) stays under 8 ms',w<8,w,'measured headless fps under throttle (software raster, includes compositing):',f2)
    await cdp.send('Emulation.setCPUThrottlingRate',{'rate':1})
    await b.close()
  t.done(errs)
asyncio.run(main())
