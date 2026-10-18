# Never stuck: a solver bot clears many random rounds in Quick Rummage and the Bottomless Drawer (clock frozen),
# and clears all 20 Big Cleanout challenges inside their time limits at a human-ish pace.
from util import *
async def main():
  t=T('bot')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p);E=pg.evaluate
    await E("JD.save.tut=1;JD.frozen=true")
    # random endless rounds
    tot=0;worst=0;fails=[]
    for mode in ['quick','bottomless']:
      for seed in range(6):
        r=await E(f"""(()=>{{Math.random=(()=>{{let a={seed*977+13};return()=>{{a=(a*16807)%2147483647;return a/2147483647}}}})();JD.start('{mode}');BOT.run(.6);BOT.god=true;
          const per=[];let last=0;let res;for(let k=0;k<26;k++){{const f0=JD.M.finds;res=BOT.play(1,400);if(res.err)return {{err:res.err,req:res.req,finds:JD.M.finds}};
          }}return {{finds:JD.M.finds,objs:WD.live().length,ended:JD.M.ended}}}})()""")
        if 'err' in r:fails.append((mode,seed,r))
        tot+=r.get('finds',0)
    t.chk('endless modes: bot never hits a request it cannot satisfy',not fails,fails)
    print('endless finds total',tot)
    # deeper: per-request action budget
    r=await E("""(()=>{JD.start('bottomless');BOT.run(.6);BOT.god=true;const acts=[];for(let k=0;k<40;k++){const f=JD.M.finds;let n=0;while(JD.M.finds===f&&n<80){const a=BOT.step();if(a==='NOTARGET')return{err:JD.M.req.text};if(a!=='wait')n++;BOT.run(a==='wait'?.1:.3);JD.M.reqLeft=1e6;}acts.push(n);}return{acts,depth:JD.M.depth,objs:WD.live().length,tang:WD.tangles.length}})()""")
    t.chk('bottomless: 40 requests in a row each solved in <= 60 actions',('err' not in r) and max(r['acts'])<=60 and r['depth']>=40,r)
    # all 20 challenges at 1.1 s per action
    res=[]
    for i in range(20):
      r=await E(f"""(()=>{{JD.start('cleanout',{{i:{i}}});BOT.god=false;BOT.run(.6);const q=BOT.play(1.1,400);return {{q,state:JD.M.ended,left:JD.M.time,queue:JD.M.queue.length,mistakes:SC.mistakes,breaks:SC.breaks,par:LV.CHALLENGES[{i}].par,limit:LV.CHALLENGES[{i}].time}}}})()""")
      await pg.wait_for_timeout(1000)
      rec=await E(f"JD.save.chal[{i}]")
      res.append((i,r['q'].get('t'),r['limit'],r['par'],rec and rec['stars'],r['q'].get('err')))
      t.chk(f'challenge {i+1}: bot clears it inside the time limit',rec is not None and rec['stars']>=1 and not r['q'].get('err'),r,rec)
    for x in res:print('chal',x)
    t.chk('progress saved: all 20 challenges recorded',await E("PG.chalDone(JD.save)")==20)
  t.done(errs)
asyncio.run(main())
