# Special mechanics: fragile (drop + wall), magnets (attract, carry, pull off, sweep), tangles (move as one, knot taps, shake),
# mystery, combo, false matches, every drawer disaster (+ scheduling), buried bonus, oddities, gentle hints.
from util import *
import math
async def main():
  t=T('mechanics')
  async with async_playwright() as p:
    b,c,pg,errs=await page(p);E=pg.evaluate;tc=await Touch(pg).init()
    await E("JD.save.tut=1;JD.start('quick')");await pg.wait_for_timeout(900)
    # ---- fragile: heavy padlock dropped on the lightbulb
    await E("window.S=BOT.scene([['lightbulb',150,280,0],['padlock',150,110,0]])");await pg.wait_for_timeout(100)
    a=await E("BOT.pt(S[1])");bb=await E("RD.toScreen(S[0].x,S[0].y-10)")
    await tc.send('touchStart',[(0,a)])
    for k in range(1,13):
      await tc.send('touchMove',[(0,(a[0]+(bb[0]-a[0])*k/12,a[1]+(bb[1]-a[1])*k/12))]);await pg.wait_for_timeout(16)
    await pg.wait_for_timeout(250);warn=await E("S[0].warn");t.chk('fragile: glass glows red while something heavy hovers over it',warn>0,warn)
    await pg.screenshot(path='../screenshots/fragile_warning.png')
    sc0=await E("SC.score=200");await tc.send('touchEnd',[]);await pg.wait_for_timeout(700)
    r=await E("[S[0].broken,SC.breaks,JD.save.stats.broken,SC.score,!!JD.save.ach.crunch,SC.streak]")
    t.chk('fragile: dropping the padlock on the bulb cracks it, costs points, earns Crunch',r[0]==1 and r[1]==1 and r[2]==1 and r[3]==150 and r[4],r)
    await pg.screenshot(path='../screenshots/fragile_crack.png')
    await E("window.S=BOT.scene([['glasses',150,280,0],['eraser',150,110,0]])")
    a=await E("BOT.pt(S[1])");bb=await E("RD.toScreen(S[0].x,S[0].y)");await tc.drag(a,bb);await pg.wait_for_timeout(600)
    t.chk('fragile: something light (eraser) can be put on glass safely',await E("S[0].broken")==0)
    await E("window.S=BOT.scene([['watch',150,250,0]]);WD.release(S[0],300,0);BOT.run(2)");t.chk('fragile: a gentle slide into the wall is fine',await E("S[0].broken")==0)
    await E("WD.release(S[0],1300,0);BOT.run(2)");t.chk('fragile: flinging glass hard into the wall breaks it',await E("S[0].broken")==1)
    # broken target still counts (never stuck), without the clean bonus
    await E("BOT.ask({id:'watch'})");await E("JD.submit(S[0])");t.chk('a cracked item can still be handed over',await E("SC.finds")==1 and await E("SC.log[SC.log.length-1].clean")==0)
    await pg.wait_for_timeout(900)
    # ---- magnets
    await E("window.S=BOT.scene([['horseshoe_magnet',156,220,0],['screw',60,400,0],['penny',250,400,0],['paperclip',250,100,0]])");await pg.wait_for_timeout(100)
    a=await E("BOT.pt(S[1])");bb=await E("RD.toScreen(156+62,220)");await tc.drag(a,bb);await pg.wait_for_timeout(600)
    t.chk('magnet: metal dropped near it snaps on',await E("S[1].mag===S[0]"))
    a=await E("BOT.pt(S[2])");bb=await E("RD.toScreen(156,220+60)");await tc.drag(a,bb);await pg.wait_for_timeout(600)
    t.chk('magnet: a penny is not magnetic and stays put',await E("S[2].mag===null"))
    d0=await E("Math.hypot(S[1].x-S[0].x,S[1].y-S[0].y)")
    a=await E("BOT.pt(S[0])");bb=await E("RD.toScreen(200,120)");await tc.drag(a,bb,steps=16);await pg.wait_for_timeout(600)
    r=await E("[S[1].mag===S[0],Math.hypot(S[1].x-S[0].x,S[1].y-S[0].y),S[3].mag===S[0]]")
    t.chk('magnet: dragging the magnet carries what is stuck to it',r[0] and abs(r[1]-d0)<3,d0,r)
    t.chk('magnet: sweeping the magnet past a paperclip grabs it too',r[2],r)
    await pg.screenshot(path='../screenshots/magnet.png')
    a=await E("BOT.pt(S[1])");await tc.drag(a,(a[0]+18,a[1]+10),steps=6);await pg.wait_for_timeout(600)
    t.chk('magnet: a small tug is not enough, it snaps back on',await E("S[1].mag===S[0]"))
    a=await E("BOT.pt(S[1])");await tc.drag(a,(a[0]+120,a[1]+150),steps=14);await pg.wait_for_timeout(600)
    r=await E("[S[1].mag,JD.save.stats.unstuck,Math.hypot(S[1].x-S[0].x,S[1].y-S[0].y)]");t.chk('magnet: pulling hard pulls it off',r[0] is None and r[1]==1 and r[2]>60,r)
    # ---- tangles
    await E("window.S=BOT.scene([['cable',150,250,0],['car_key',155,252,0.4]]);WD.tangle(S[0],S[1],3)");await pg.wait_for_timeout(100)
    off0=await E("[S[0].x-S[1].x,S[0].y-S[1].y]")
    a=await E("BOT.pt(S[1])")
    if a is None:a=await E("BOT.pt(S[0])")
    await tc.drag(a,(a[0]+60,a[1]+90),steps=12);await pg.wait_for_timeout(500)
    r=await E("[S[0].x-S[1].x,S[0].y-S[1].y,S[0].tang!==null,S[1].x]")
    t.chk('tangle: dragging one drags the other as a single lump',abs(r[0]-off0[0])<2 and abs(r[1]-off0[1])<2 and r[2],off0,r)
    t.chk('tangle: tray refuses a tangled lump',await E("WD.toTray(S[1])")=='tangled')
    await pg.screenshot(path='../screenshots/tangle.png')
    for k in range(3):
      kp=await E("RD.toScreen(...WD.knotPos(S[0].tang||{a:S[0],b:S[1]}))");await tc.tap(kp);await pg.wait_for_timeout(150)
    await pg.wait_for_timeout(500)
    r=await E("[S[0].tang,S[1].tang,JD.save.stats.knots,Math.hypot(S[0].x-S[1].x,S[0].y-S[1].y)]")
    t.chk('tangle: three taps on the knot pull them apart',r[0] is None and r[1] is None and r[2]==3,r)
    await E("window.S=BOT.scene([['cable',150,250,0],['spoon',155,252,0.4]]);WD.tangle(S[0],S[1],2)")
    a=await E("BOT.pt(S[1])||BOT.pt(S[0])");await tc.send('touchStart',[(0,a)])
    x=a[0]
    for k in range(1,40):
      x=a[0]+(45 if (k//2)%2 else -45);await tc.send('touchMove',[(0,(x,a[1]))]);await pg.wait_for_timeout(10)
    await tc.send('touchEnd',[]);await pg.wait_for_timeout(400)
    r=await E("[S[0].tang===null,JD.save.stats.knots]");t.chk('tangle: shaking it while dragging works it loose',r[0],r)
    # ---- mystery
    await E("window.S=BOT.scene([['penny',80,100,0],['screwdriver_small',200,300,0],['allen_key',100,350,0]])")
    await E("BOT.ask({tag:'tighten'})");ask=await pg.text_content('#ask');f0=await E("SC.finds")
    await E("JD.submit(S[0])");t.chk('mystery: a description request rejects the penny',await E("JD.M.req.mistakes")==1,ask)
    await E("JD.submit(S[1])");t.chk('mystery: any tool that can tighten counts (small screwdriver)',await E("SC.finds")==f0+1 and await E("JD.save.stats.mystery")==1,ask)
    await pg.wait_for_timeout(900)
    # ---- combo
    await E("window.S=BOT.scene([['flashlight',80,100,0],['battery_dead',200,300,0],['battery_aa',100,350,0]]);SC.reset()")
    await E("BOT.ask({combo:'flash'})");await pg.wait_for_timeout(100)
    t.chk('combo: note shows two empty slots',await E("document.querySelectorAll('#slots span').length")==2)
    await E("JD.submit(S[0])");r=await E("[JD.M.req.filled.filter(Boolean).length,JD.M.busy,document.querySelectorAll('#slots span.on').length,SC.finds]")
    t.chk('combo: first item fills one slot, request stays open',r==[1,False,1,0],r)
    await E("JD.submit(S[1])");t.chk('combo: a dead battery is the wrong second item',await E("JD.M.req.mistakes")==1)
    await E("JD.submit(S[2])");r=await E("[SC.finds,JD.save.stats.combos,SC.log[0].combo]");t.chk('combo: second item completes it, combo bonus paid',r[0]==1 and r[1]==1 and r[2]==90,r)
    await pg.screenshot(path='../screenshots/combo_done.png');await pg.wait_for_timeout(900)
    # ---- false matches
    await E("window.S=BOT.scene([['screwdriver_big',80,100,0],['screwdriver_small',200,300,0],['screwdriver_tiny',100,350,0]])")
    await E("BOT.ask({decoy:'screwdriver_tiny'})");await E("JD.submit(S[1])")
    rep=await pg.text_content('#reply');t.chk('false match: the small screwdriver gets "Smaller."',rep=='Smaller.',rep)
    await E("JD.submit(S[2])");t.chk('false match: the tiny one is right',await E("SC.finds")>=2 and await E("JD.save.stats.decoys")==1)
    await pg.wait_for_timeout(900)
    await E("window.S=BOT.scene([['battery_dead',80,100,0],['battery_dead',200,300,0],['battery_aa',100,350,0]])");await E("BOT.ask({decoy:'battery_aa'})");await E("JD.submit(S[0])")
    rep=await pg.text_content('#reply');t.chk('false match: dead battery reply',"dead" in rep,rep)
    await pg.wait_for_timeout(300)
    # ---- disasters
    for kind,scene,mover in [('roll',"[['battery_aa',150,250,0],['comb',60,80,0]]",0),('spring',"[['spring',156,250,0],['screw',176,250,0],['screw',140,260,1],['paperclip',156,280,0]]",1),('snap',"[['rubber_band',156,250,0],['eraser',176,260,0],['button',140,240,0]]",0),('slam',"[['eraser',156,250,0],['comb',100,120,0],['cassette',200,350,0]]",0)]:
      await E(f"window.S=BOT.scene({scene})");p0=await E("S.map(o=>[o.x,o.y])")
      ok=await E(f"!!WD.disaster('{kind}',Math.random)");await E("BOT.run(.25)");await pg.wait_for_timeout(50)
      toast=await E("[...document.querySelectorAll('.toast')].map(e=>e.textContent).join('|')")
      await E("BOT.run(1.5)");p1=await E("S.map(o=>[o.x,o.y])")
      mv=max(math.hypot(p1[i][0]-p0[i][0],p1[i][1]-p0[i][1]) for i in range(len(p0)))
      inside=await E("WD.live().every(o=>{const b=WD.bounds(o);return b[0]>-3&&b[2]<WD.W+3&&b[1]>-3&&b[3]<WD.H+3})")
      t.chk(f'disaster "{kind}": fires, shakes things up, tells the player, nothing leaves the drawer',ok and mv>25 and len(toast)>5 and inside,round(mv),toast[-60:])
    await E("JD.start('cleanout',{i:14})");await pg.wait_for_timeout(700)
    r=await E("(()=>{AU.played.length=0;let n=0;const c=x=>{};WD.on((ty)=>{if(ty==='disaster')window.__dis=(window.__dis||0)+1});JD.M.time=999;BOT.run(45);return window.__dis||0})()")
    t.chk('disasters are scheduled during a challenge that uses them ("Uh Oh")',r>=2,r)
    # ---- buried bonus
    await E("JD.start('quick')");await pg.wait_for_timeout(700)
    r=await E("""(()=>{const M=JD.M;M.time=999;SC.reset();WD.reset();const t=WD.add(OBJ.DEFS.button,150,250,0);for(let i=0;i<4;i++){const c=WD.add(OBJ.DEFS.cassette,150+(i-2)*3,250+(i%2)*4,i*.4);}
      BOT.ask({id:'button'});M.req.vis0=WD.vis(t);M.reqT=3;JD.submit(t);return [M.req.vis0,SC.log[0].hidden,JD.save.stats.deep]})()""")
    t.chk('finding something buried pays a bonus (fully hidden pays more)',r[1]>=60,r)
    # ---- oddity
    await pg.wait_for_timeout(900)
    await E("window.S=BOT.scene([['gold_ring',156,250,0]])");a=await E("BOT.pt(S[0])");await tc.tap(a,hold=700);await pg.wait_for_timeout(200)
    r=await E("[JD.save.stats.oddities,!!JD.save.ach.oddity]");t.chk('oddity: a closer look at a rare find logs it and earns "Huh."',r[0]==['gold_ring'] and r[1],r)
    # ---- gentle hints
    r=await E("""(()=>{window.S=BOT.scene([['button',150,250,0],['cassette',150,250,0.2]]);BOT.ask({id:'button'});JD.M.req.hintT=0;let w=0;for(let i=0;i<60*15;i++){JD.tick(1/60);if(S[1].hint>0||S[1].wob>0)w++;}return w})()""")
    t.chk('gentle hints: after a while the thing on top of the target wiggles',r>0,r)
    await E("JD.save.set.hints=false");r=await E("""(()=>{window.S=BOT.scene([['button',150,250,0],['cassette',150,250,0.2]]);BOT.ask({id:'button'});let w=0;for(let i=0;i<60*15;i++){JD.tick(1/60);if(S[1].hint>0)w++;}return w})()""")
    t.chk('gentle hints can be turned off',r==0,r);await E("JD.save.set.hints=true")
  t.done(errs)
asyncio.run(main())
