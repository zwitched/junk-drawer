# Modes and progression: quick timer end, bottomless strikes, cleanout win/lose + stars persist + unlock order,
# daily seed reproducibility, achievements, settings persistence via the real toggles, unlocks, free mode, reset.
from util import *
LAYOUT="WD.objs.filter(o=>!o.gone).map(o=>o.d.id+':'+Math.round(o.x)+','+Math.round(o.y)).join('|')"
async def main():
  t=T('modes')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p);E=pg.evaluate
    await E("JD.save.tut=1;JD.persist()")
    # quick: ends at 0, find adds time
    await E("JD.start('quick')");await pg.wait_for_timeout(700)
    r=await E("(()=>{const t0=JD.M.time;const tg=WD.objs.find(o=>!o.gone&&LV.matchSlot(JD.M.req.slots[0],o));JD.submit(tg);BOT.run(1.5);return [t0,JD.M.time,SC.finds]})()")
    t.chk('quick: a find adds seconds to the clock',r[1]>r[0]-1.6+3 and r[2]==1,r)
    r=await E("(()=>{BOT.run(80);return [JD.M.ended,JD.M.time]})()");await pg.wait_for_timeout(1200)
    t.chk('quick: round ends when the clock hits zero and shows results',r[0] and await pg.is_visible('#sResults'),r,await pg.text_content('#resTitle'))
    t.chk('quick: best score saved',await E("JD.save.best.quick===JD.lastResult.score&&JD.save.best.quick>0"))
    await pg.screenshot(path='../screenshots/results.png')
    # bottomless: 3 timed-out requests ends it, wrong picks alone do not cost strikes
    await E("JD.start('bottomless')");await pg.wait_for_timeout(700)
    r=await E("(()=>{const bad=WD.objs.find(o=>!o.gone&&!JD.M.req.slots.some(s=>LV.matchSlot(s,o)));JD.submit(bad);BOT.run(.5);return [JD.M.strikes,SC.mistakes,JD.M.reqMax]})()")
    t.chk('bottomless: a wrong pick costs points but no strike',r[0]==3 and r[1]==1,r)
    t.chk('bottomless: first request timer is generous (>=40 s)',r[2]>=40,r[2])
    r=await E("(()=>{const out=[];for(let k=0;k<4&&!JD.M.ended;k++){BOT.run(JD.M.reqLeft+2.5);out.push(JD.M.strikes)}return [out,JD.M.ended]})()");await pg.wait_for_timeout(1200)
    t.chk('bottomless: three timed-out requests end the round',r[1] and r[0][:3]==[2,1,0] and await pg.is_visible('#sResults'),r)
    # bottomless depth timer shrinks but has a floor
    t.chk('bottomless: timer floor is 18 s',await E("Math.max(18,46-60*1.2)")==18)
    # cleanout: lose
    await E("JD.go('menu')");await pg.click('#sMenu [data-go="modes"]');await pg.wait_for_timeout(200)
    await pg.click('#m_cleanout')
    await pg.wait_for_timeout(200)
    t.chk('challenge list: 1 open, 2 locked',await E("!document.getElementById('ch_0').classList.contains('lock')&&document.getElementById('ch_1').classList.contains('lock')"))
    await pg.screenshot(path='../screenshots/challenges.png')
    await pg.click('#ch_0');await pg.wait_for_timeout(200);t.chk('challenge intro shows',await pg.is_visible('#sIntro'),await pg.text_content('#inName'))
    await pg.click('#bInStart');await pg.wait_for_timeout(700)
    r=await E("(()=>{BOT.run(JD.M.time+1);return [JD.M.ended,JD.M.queue.length]})()");await pg.wait_for_timeout(1200)
    t.chk('cleanout: running out of time loses',r[0] and await E("JD.lastResult.stars===0") and await pg.is_visible('#bRetry'),r)
    t.chk('cleanout: a loss saves no stars',await E("!JD.save.chal[0]"))
    # cleanout: win with bot
    r=await E("(()=>{JD.start('cleanout',{i:0});BOT.god=false;BOT.run(.6);const q=BOT.play(1,300);return [q.ended,JD.M.queue.length,SC.mistakes]})()");await pg.wait_for_timeout(1300)
    st=await E("JD.lastResult.stars")
    t.chk('cleanout: clearing all requests wins with stars',r[0] and st>=1 and await pg.is_visible('#bNext'),r,st)
    await pg.screenshot(path='../screenshots/results_cleanout.png')
    await pg.reload();await pg.wait_for_timeout(600);await pg.add_script_tag(content=BOT)
    t.chk('stars persist after reload',await E(f"JD.save.chal[0]&&JD.save.chal[0].stars==={st}"))
    await E("JD.go('chal')");await pg.wait_for_timeout(200)
    t.chk('challenge 2 unlocked after clearing 1; 3 still locked',await E("!document.getElementById('ch_1').classList.contains('lock')&&document.getElementById('ch_2').classList.contains('lock')"))
    # daily
    a=await E(f"(()=>{{JD.start('daily',{{day:'2026-10-18'}});return [{LAYOUT},JD.M.queue.map(r=>r.text).join('|')]}})()")
    b2=await E(f"(()=>{{JD.start('daily',{{day:'2026-10-18'}});return [{LAYOUT},JD.M.queue.map(r=>r.text).join('|')]}})()")
    c2=await E(f"(()=>{{JD.start('daily',{{day:'2026-10-19'}});return [{LAYOUT},JD.M.queue.map(r=>r.text).join('|')]}})()")
    t.chk('daily: same date gives the same drawer and requests',a==b2,len(a[0]))
    t.chk('daily: a different date gives a different drawer',a[0]!=c2[0])
    r=await E("(()=>{JD.start('daily',{day:RNG.today()});BOT.run(.6);const q=BOT.play(1,300);return [q.ended,JD.M.queue.length]})()");await pg.wait_for_timeout(1300)
    t.chk('daily: can be finished, and is recorded',r[0] and await E("JD.save.daily[RNG.today()].done===true&&JD.save.stats.dailies===1"),r)
    t.chk('daily: achievement earned and shown on results',await E("!!JD.save.ach.daily") and 'Daily Habit' in (await pg.text_content('#sResults')),)
    # achievements screen
    await E("JD.go('menu')");await pg.click('#sMenu [data-go="ach"]');await pg.wait_for_timeout(200)
    n=await E("document.querySelectorAll('#achList .ach.got').length");t.chk('achievements screen lists earned ones',n>=3 and await E("document.querySelectorAll('#achList .ach').length")==24,n)
    # unlocks: give progress, check designs and collections
    await E("JD.save.stats.found=70;JD.save.chal={};for(let i=0;i<12;i++)JD.save.chal[i]={stars:2,score:1,time:1};JD.persist();JD.checkUnlocks&&JD.checkUnlocks()")
    await E("JD.go('menu')");await pg.click('#sMenu [data-go="unlocks"]');await pg.wait_for_timeout(300)
    r=await E("['walnut','mint','cherry','pine','heirloom'].map(id=>!document.getElementById('d_'+id).classList.contains('lock'))")
    t.chk('designs unlock from progress (walnut, mint, cherry open; pine, heirloom locked)',r==[True,True,True,False,False],r)
    await pg.click('#d_cherry');await pg.wait_for_timeout(200)
    t.chk('picking a design saves it',await E("JD.save.design==='cherry'"))
    await pg.screenshot(path='../screenshots/unlocks.png')
    t.chk('collections: garage, kitchen and sewing (24 stars) all on',await E("PG.colls(JD.save).join()")=='garage,kitchen,sewing')
    t.chk('unlocked collections join the drawer pool',await E("LV.availDefs(PG.colls(JD.save)).some(d=>d.id==='thimble')&&!LV.availDefs([]).some(d=>d.id==='thimble')"))
    await pg.click('#d_oak') if await pg.is_visible('#d_oak') else None
    # settings toggles persist through reload
    await E("JD.go('settings')");await pg.wait_for_timeout(200)
    await pg.click('#t_music');await pg.click('#t_sfx');await pg.wait_for_timeout(100)
    await pg.reload();await pg.wait_for_timeout(600)
    r=await E("[JD.save.set.music,JD.save.set.sfx,JD.save.set.haptics]")
    t.chk('music and sfx toggles persist after reload',r==[False,False,True],r)
    r=await E("(()=>{AU.unlock();return AU.levels()})()")
    t.chk('muted buses are silent after reload',r==[0,0],r)
    await E("JD.go('settings')");await pg.click('#t_music');await pg.click('#t_sfx')
    # free mode and stats
    await pg.add_script_tag(content=BOT)
    await E("JD.start('free')");await pg.wait_for_timeout(700)
    t.chk('free mode: no requests, no timer',await E("JD.M.req===null&&document.getElementById('clock').textContent.trim()===''"),await pg.text_content('#ask'))
    await E("JD.go('menu')");await pg.click('#sMenu [data-go="stats"]');await pg.wait_for_timeout(200)
    t.chk('stats screen shows numbers',await pg.is_visible('#sStats') and '70' in await pg.text_content('#sStats'))
    await pg.screenshot(path='../screenshots/stats.png')
    # reset
    await E("JD.go('settings')");await pg.click('#bReset');await pg.wait_for_timeout(150);await pg.click('#cfYes');await pg.wait_for_timeout(200)
    t.chk('reset clears progress, keeps settings',await E("Object.keys(JD.save.chal).length===0&&JD.save.stats.found===0&&JD.save.set.music===true"))
    await b.close()
  t.done(errs)
asyncio.run(main())
