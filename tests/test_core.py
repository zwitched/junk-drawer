# Core: launch + first request time, tutorial with real touches, menus/buttons, touch drag, lift, fling, collision nudge,
# stacking, uncovering, completing, wrong picks, rotate buttons, two-finger twist, tray, drop on note, pointercancel, pause/visibility, resize.
from util import *
async def main():
  t=T('core')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p);E=pg.evaluate;tc=await Touch(pg).init()
    # ---- launch & first request time
    t0=await E("performance.now()")
    t.chk('title screen shows on launch',await pg.is_visible('#sTitle') and await pg.is_visible('#bPlay'))
    await pg.tap('#bPlay');await pg.wait_for_function("document.getElementById('ask').textContent.includes('key')",timeout=10000)
    t1=await E("performance.now()");t.chk('first request (tutorial) appears within 10 s of tapping Play',t1-t0<10000,round(t1-t0))
    t.chk('tutorial step 0 shown',await E("JD.M.kind==='tutorial'&&JD.M.tstep===0") and await pg.is_visible('#tut'))
    await pg.screenshot(path='../screenshots/tutorial.png')
    # drag the top coverer away with a real touch drag
    for k in range(4):
      if await E("JD.M.tstep")>0:break
      cv=await E("(()=>{const c=WD.coverers(JD.M.tk.key)[0];return [0,0,c.uid]})()")
      grab=await E(f"(()=>{{const o=WD.objs.find(o=>o.uid=={cv[2]});const e=SPR.get(o.d),p=e.pts;for(let i=0;i<p.length;i+=2){{const c=Math.cos(o.r),s=Math.sin(o.r),x=o.x+p[i]*c-p[i+1]*s,y=o.y+p[i]*s+p[i+1]*c;if(WD.pick(x,y)===o)return RD.toScreen(x,y)}}return RD.toScreen(o.x,o.y)}})()")
      await tc.drag(grab,(grab[0]+(150 if grab[0]<200 else -150),grab[1]+140),steps=14)
      await pg.wait_for_timeout(500)
    t.chk('tutorial: dragging clutter uncovers the key (step advances)',await E("JD.M.tstep")>=1,await E("WD.vis(JD.M.tk.key)"))
    kp=await E("(()=>{const o=JD.M.tk.key;const e=SPR.get(o.d),p=e.pts;for(let i=0;i<p.length;i+=2){const c=Math.cos(o.r),s=Math.sin(o.r),x=o.x+p[i]*c-p[i+1]*s,y=o.y+p[i]*s+p[i+1]*c;if(WD.pick(x,y)===o)return RD.toScreen(x,y)}})()")
    await tc.tap(kp);await pg.wait_for_timeout(250)
    t.chk('tutorial: tap selects the key',await E("JD.sel===JD.M.tk.key&&JD.M.tstep===2"))
    t.chk('action bar appears when something is selected',await pg.is_visible('#bGive') and await pg.is_visible('#bRotL'))
    await tc.tap(kp);await pg.wait_for_timeout(1300)
    t.chk('tutorial: second tap hands it over',await E("JD.M.tk.key.gone&&JD.M.tstep===3"))
    car=await E("BOT.pt(JD.M.tk.car)");slot=await E("RD.toScreen(...WD.slotPos(2))")
    await tc.drag(car,slot,steps=16);await pg.wait_for_timeout(400)
    t.chk('tutorial: dragging the car into the tray works',await E("JD.M.tk.car.tray>=0&&JD.M.tstep===4"))
    o=await E("(()=>{const o=WD.live().filter(o=>WD.vis(o)>.95)[0];return BOT.pt(o)})()")
    await tc.tap(o,hold=700);await pg.wait_for_timeout(200)
    t.chk('tutorial: long-press opens the closer look card',await pg.is_visible('#inspect') and await E("JD.M.tstep===5"),await pg.text_content('#insName'))
    await pg.screenshot(path='../screenshots/inspect.png')
    await pg.click('#bTutMenu');await pg.wait_for_timeout(300)
    t.chk('tutorial done: saved and back at menu',await E("JD.save.tut===1&&JD.state==='menu'"))
    # ---- every menu button
    for go,sid in [('modes','sModes'),('unlocks','sUnlocks'),('ach','sAch'),('stats','sStats'),('settings','sSettings')]:
      await E("JD.go('menu')");await pg.click(f'#sMenu [data-go="{go}"]');await pg.wait_for_timeout(200)
      t.chk(f'menu button opens {go}',await pg.is_visible('#'+sid))
      back=await pg.query_selector(f'#{sid} .back');await back.click();await pg.wait_for_timeout(200)
      t.chk(f'{go}: back works',await E("JD.state")=='menu' or await E("JD.state")=='modes')
    await E("JD.go('modes')");n=await E("document.querySelectorAll('#modeList .mode').length");t.chk('mode select lists 5 modes',n==5,n)
    await pg.click('#m_cleanout');await pg.wait_for_timeout(200);t.chk('cleanout opens challenge select with 20 tags',await pg.is_visible('#sChal') and await E("document.querySelectorAll('#chalGrid .ch').length")==20)
    await pg.click('#ch_1');await pg.wait_for_timeout(200);t.chk('locked challenge stays locked',await pg.is_visible('#sChal'))
    await pg.click('#ch_0');await pg.wait_for_timeout(200);t.chk('challenge 1 opens its intro card',await pg.is_visible('#sIntro'))
    await pg.click('#sIntro [data-go="chal"]');await pg.wait_for_timeout(200);t.chk('intro back',await pg.is_visible('#sChal'))
    await E("JD.go('menu')");await pg.click('#bDaily2');await pg.wait_for_timeout(700);t.chk('menu: Daily Drawer starts the daily',await E("JD.M.kind==='daily'&&JD.state==='play'"))
    await pg.click('#bPause');await pg.wait_for_timeout(200);t.chk('pause button opens pause menu',await pg.is_visible('#sPause'))
    await pg.click('#bPauseSet');await pg.wait_for_timeout(200);t.chk('pause > settings',await pg.is_visible('#sSettings'))
    await pg.click('#bSetBack');await pg.wait_for_timeout(200);t.chk('settings back returns to pause',await pg.is_visible('#sPause'))
    await pg.click('#bRestart');await pg.wait_for_timeout(700);t.chk('restart starts a fresh round',await E("JD.state==='play'&&JD.M.kind==='daily'&&SC.finds===0"))
    await pg.click('#bPause');await pg.click('#bQuit');await pg.wait_for_timeout(200);t.chk('quit to menu',await E("JD.state==='menu'&&JD.M.ended"))
    await pg.click('#bHow');await pg.wait_for_timeout(700);t.chk('How to play replays the tutorial',await E("JD.M.kind==='tutorial'"))
    await pg.click('#bTutSkip');await pg.wait_for_timeout(200);t.chk('tutorial skip goes to menu',await E("JD.state==='menu'"))
    # ---- touch dragging in a real round
    await E("JD.start('quick')");await pg.wait_for_timeout(900)
    await E("JD.M.time=999")
    info=await E("""(()=>{const o=WD.live().filter(o=>WD.vis(o)>.98&&!o.mag&&!o.tang&&!o.d.magnet).sort((a,b)=>Math.abs(a.x-156)+Math.abs(a.y-220)-Math.abs(b.x-156)-Math.abs(b.y-220))[0];return {uid:o.uid,x:o.x,y:o.y,z:o.z,s:BOT.pt(o),rs:RD.s}})()""")
    S=f"WD.objs.find(o=>o.uid=={info['uid']})"
    a=info['s'];bpt=(a[0]+70,a[1]+50)
    await tc.send('touchStart',[(0,a)])
    for k in range(1,11):
      await tc.send('touchMove',[(0,(a[0]+7*k,a[1]+5*k))]);await pg.wait_for_timeout(16)
    await pg.wait_for_timeout(200)
    mid=await E(f"(()=>{{const o={S};return {{held:o.held,lift:o.lift,top:WD.objs[WD.objs.length-1]===o||WD.group(o).includes(WD.objs[WD.objs.length-1]),x:o.x,y:o.y}}}})()")
    t.chk('drag: object is held, lifted (shadow grows) and raised to the top',mid['held']==1 and mid['lift']>.6 and mid['top'],mid)
    t.chk('drag: object follows the finger',abs(mid['x']-(info['x']+70/info['rs']))<6 and abs(mid['y']-(info['y']+50/info['rs']))<6,mid,info)
    await tc.send('touchEnd',[]);await pg.wait_for_timeout(600)
    aft=await E(f"(()=>{{const o={S};return {{held:o.held,lift:o.lift}}}})()");t.chk('release: object settles (lift back to 0)',aft['held']==0 and aft['lift']<.05,aft)
    t.chk('drag counted in stats',await E("JD.save.stats.moved")>=1)
    # ---- fling + walls
    await E(f"(()=>{{const o={S};o.x=150;o.y=200;}})()");a=await E(f"BOT.pt({S})")
    await tc.send('touchStart',[(0,a)])
    for k in range(1,7):
      await tc.send('touchMove',[(0,(a[0]+22*k,a[1]))]);await pg.wait_for_timeout(16)
    await tc.send('touchEnd',[]);await pg.wait_for_timeout(30)
    v=await E(f"Math.hypot({S}.vx,{S}.vy)");t.chk('fling: released object keeps sliding',v>150,v)
    await pg.wait_for_timeout(1500);bd=await E(f"WD.bounds({S})");t.chk('fling: walls keep it inside the drawer',bd[0]>=-2 and bd[2]<=await E("WD.W")+2,bd)
    # ---- collision nudge
    r=await E(f"""(()=>{{const a={S};const b=WD.live().find(o=>o!==a&&!o.mag&&!o.tang&&!o.d.magnet&&o.d.wt<=a.d.wt&&!(o.tang));
      for(const o of WD.live())if(o!==a&&o!==b){{o.x=-999;}}
      a.x=60;a.y=220;a.r=0;a.vx=a.vy=0;b.x=200;b.y=220;b.vx=b.vy=0;b.r=0;WD.raise(b);a.vx=700;const bx=b.x;BOT.run(1.2);const r={{moved:b.x-bx,bv:b.uid}};
      return r}})()""")
    t.chk('collision: a sliding object nudges what it runs into',r['moved']>4,r)
    await E("JD.start('quick')");await pg.wait_for_timeout(900);await E("JD.M.time=999")
    # ---- stacking: drop on top
    r=await E("""(()=>{const L=WD.live().filter(o=>!o.mag&&!o.tang&&!o.d.magnet&&!o.d.fragile);const a=L[0],b=L[1];a.x=100;a.y=150;a.r=0;b.x=230;b.y=300;b.r=0;BOT.run(.1);return {a:RD.toScreen(a.x,a.y),b:BOT.pt(b),ua:a.uid,ub:b.uid}})()""")
    await tc.drag(r['b'],r['a'],steps=12);await pg.wait_for_timeout(500)
    z=await E(f"(()=>{{const a=WD.objs.find(o=>o.uid=={r['ua']}),b=WD.objs.find(o=>o.uid=={r['ub']});return [a.z,b.z,WD.pick(a.x,a.y)===b]}})()")
    t.chk('stacking: dropped object lands on top of the other one',z[1]>z[0] and z[2],z)
    # ---- uncovering
    r=await E("""(()=>{const L=WD.live().filter(o=>!o.mag&&!o.tang&&!o.d.magnet&&!o.d.fragile&&!o.d.rare);const t=L.find(o=>o.d.id!=='cable'&&o.d.w*o.d.h<2000);const t0=t;for(const o of WD.live())if(o!==t)o.x=-999;t.x=156;t.y=220;t.r=0;
      const big=L.filter(o=>o!==t&&o.d.w*o.d.h>t.d.w*t.d.h);for(let i=0;i<3;i++){const c=big[i];c.x=156+(i-1)*6;c.y=220+(i-1)*5;c.r=i;WD.raise(c);}return {uid:t.uid,vis:WD.vis(t)}})()""")
    S2=f"WD.objs.find(o=>o.uid=={r['uid']})"
    t.chk('setup: target is buried',r['vis']<.35,r)
    for k in range(5):
      cv=await E(f"(()=>{{const c=WD.coverers({S2})[0];if(!c)return null;return BOT.pt(c)}})()")
      if not cv:break
      await tc.drag(cv,(cv[0]+(130 if k%2 else -130),cv[1]+(160 if k<2 else -160)),steps=10);await pg.wait_for_timeout(450)
    v=await E(f"WD.vis({S2})");t.chk('uncover: dragging the covers away reveals the buried object',v>.8,v)
    # ---- complete a request by tapping twice
    await E(f"(()=>{{const o={S2};JD.M.req=LV.makeReq({{id:o.d.id}},JD.M.R,JD.M.avail);JD.M.req.vis0=.2;JD.M.busy=false;JD.M.reqT=1;UI.note(JD.M.req);}})()")
    sp=await E(f"BOT.pt({S2})");sc0=await E("SC.score")
    await tc.tap(sp);await pg.wait_for_timeout(120);await tc.tap(sp);await pg.wait_for_timeout(300)
    r=await E(f"[{S2}===undefined,SC.score,SC.finds,JD.save.stats.found]");t.chk('request completed: object handed over, score up',r[0] and r[1]>sc0 and r[2]==1,r)
    t.chk('celebration: stamp shown and score popup queued',await E("document.getElementById('stamp').classList.contains('on')"))
    await pg.wait_for_timeout(900)
    # ---- wrong pick
    r=await E("""(()=>{const r=JD.M.req;const o=WD.live().find(o=>LV.match(r,o)<0&&!o.d.rare&&WD.vis(o)>.9&&!o.mag&&!o.tang);return {uid:o.uid,s:BOT.pt(o),time:JD.M.time,score:SC.score}})()""")
    await tc.tap(r['s']);await pg.wait_for_timeout(120);await tc.tap(r['s']);await pg.wait_for_timeout(200)
    w=await E(f"[SC.mistakes,JD.M.req.mistakes,JD.M.time,SC.score,document.getElementById('reply').textContent,!!WD.objs.find(o=>o.uid=={r['uid']}),SC.streak]")
    t.chk('wrong pick: counted, -3 s in Quick, object stays, requester replies',w[0]==1 and w[1]==1 and r['time']-w[2]>2.9 and w[5] and len(w[4])>3,w)
    t.chk('wrong pick: score never negative, streak reset',w[3]>=0 and w[6]==0,w)
    # ---- rotate buttons
    o=await E(f"(()=>{{const o=WD.objs.find(o=>o.uid=={r['uid']});return {{s:BOT.pt(o),r:o.r}}}})()")
    await tc.tap(o['s']);await pg.wait_for_timeout(100);await pg.tap('#bRotR');await pg.wait_for_timeout(500)
    r2=await E(f"WD.objs.find(o=>o.uid=={r['uid']}).r");t.chk('rotate button turns the selected object 45 degrees',abs((r2-o['r'])-0.785)<.03,o['r'],r2)
    await pg.tap('#bRotL');await pg.wait_for_timeout(500);r3=await E(f"WD.objs.find(o=>o.uid=={r['uid']}).r");t.chk('rotate left turns it back',abs(r3-o['r'])<.03,r3)
    # ---- tray via button + give from tray
    await pg.tap('#bTray');await pg.wait_for_timeout(200);t.chk('Tray button moves the selected object into the tray',await E(f"WD.objs.find(o=>o.uid=={r['uid']}).tray")>=0)
    t.chk('tray item can be brought back',(await pg.text_content('#bTray'))=='Back')
    await pg.tap('#bTray');await pg.wait_for_timeout(600);t.chk('Back button returns it to the drawer',await E(f"WD.objs.find(o=>o.uid=={r['uid']}).tray")==-1)
    # ---- two-finger twist
    o=await E("""(()=>{const o=WD.live().find(o=>WD.vis(o)>.98&&!o.mag&&!o.tang&&!o.d.magnet&&o.d.w>50);o.x=156;o.y=220;WD.raise(o);return {uid:o.uid,s:BOT.pt(o),r:o.r}})()""")
    a=o['s'];await tc.send('touchStart',[(0,a)]);await tc.send('touchMove',[(0,(a[0]+12,a[1]))]);await pg.wait_for_timeout(40)
    await tc.send('touchMove',[(0,(a[0]+12,a[1])),(1,(a[0]+90,a[1]))]);await pg.wait_for_timeout(40)
    import math
    for k in range(1,9):
      ang=k*0.12;await tc.send('touchMove',[(0,(a[0]+12,a[1])),(1,(a[0]+12+78*math.cos(ang),a[1]+78*math.sin(ang)))]);await pg.wait_for_timeout(20)
    rr=await E(f"WD.objs.find(o=>o.uid=={o['uid']}).r");await tc.send('touchEnd',[]);await pg.wait_for_timeout(200)
    t.chk('two-finger twist rotates the held object',abs(rr-o['r']-0.96)<.15,o['r'],rr)
    # ---- pointercancel
    o=await E("""(()=>{const o=WD.live().find(o=>WD.vis(o)>.98&&!o.mag&&!o.tang&&!o.d.magnet);o.x=156;o.y=220;WD.raise(o);return {uid:o.uid,s:BOT.pt(o)}})()""")
    a=o['s'];await tc.send('touchStart',[(0,a)])
    for k in range(1,6):
      await tc.send('touchMove',[(0,(a[0]+8*k,a[1]+4*k))]);await pg.wait_for_timeout(16)
    await tc.send('touchCancel',[]);await pg.wait_for_timeout(400)
    r=await E(f"(()=>{{const o=WD.objs.find(o=>o.uid=={o['uid']});return [o.held,IN.drag===null,IN.ptrs.size,WD.held]}})()")
    t.chk('pointercancel: object is put down cleanly, no stuck drag',r[0]==0 and r[1] and r[2]==0 and r[3] is None,r)
    # ---- drag up onto the note hands it over
    await pg.wait_for_timeout(800)
    r=await E("""(()=>{const r=JD.M.req;const i=r.filled.findIndex(f=>!f);const o=WD.objs.find(o=>!o.gone&&o.tray<0&&LV.matchSlot(r.slots[i],o)&&!o.mag&&!o.tang);if(!o)return null;o.x=156;o.y=200;WD.raise(o);BOT.run(.05);const n=document.getElementById('note').getBoundingClientRect();return {s:BOT.pt(o),n:[n.left+n.width/2,n.top+n.height/2],f:SC.finds,single:r.slots.length===1}})()""")
    if r:
      await tc.drag(r['s'],r['n'],steps=14);await pg.wait_for_timeout(300)
      f=await E("SC.finds");t.chk('dragging the wanted thing onto the note hands it over',(f==r['f']+1) if r['single'] else await E("JD.M.req.filled.some(Boolean)"),r,f)
    # ---- pause on visibilitychange, time frozen
    await pg.wait_for_timeout(900);tb=await E("JD.M.time")
    await E("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    await pg.wait_for_timeout(1200);t.chk('backgrounding pauses automatically',await E("JD.state")=='pause')
    ta=await E("JD.M.time");t.chk('clock frozen while paused',abs(ta-tb)<.3,tb,ta)
    await E("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
    await pg.click('#bResume');await pg.wait_for_timeout(300);t.chk('resume continues the round',await E("JD.state==='play'&&!JD.M.ended"))
    # ---- resize
    s0=await E("RD.s");await pg.set_viewport_size({'width':360,'height':740});await pg.wait_for_timeout(400);s1=await E("RD.s")
    t.chk('resize: drawer rescales to the new viewport',s1!=s0 and await E("RD.toScreen(WD.W,0)[0]")<=360,s0,s1)
    await pg.set_viewport_size({'width':412,'height':839});await pg.wait_for_timeout(300)
    # ---- haptics + audio calls (cannot hear/feel them headless; check the calls happen)
    await E("window.__vib=[];navigator.vibrate=(p)=>{__vib.push(p);return true}")
    await E("(()=>{const o=WD.live().find(o=>WD.vis(o)>.9&&!o.mag&&!o.tang);JD.tapObj(o);})()")
    t.chk('haptics: navigator.vibrate is called on interactions',await E("__vib.length")>0)
    t.chk('audio: context created after a gesture and sounds were triggered',await E("!!AU.ctx&&AU.played.length>5"),await E("AU.played.slice(-8)"))
  t.done(errs)
asyncio.run(main())
