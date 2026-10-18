# Layout on phone sizes + desktop: no sideways overflow on any screen, HUD/drawer/tray/bar stack without overlap,
# key buttons are on screen and not covered (elementFromPoint), touch targets big enough. Saves a screenshot per size.
from util import *
SIZES=[('320x568',320,568),('360x740',360,740),('390x844',390,844),('430x932',430,932),('desktop',1280,800),('landscape-phone',844,390)]
SCREENS=['title','menu','modes','chal','settings','ach','unlocks','stats']
VIS="""(sel=>{const e=document.querySelector(sel);if(!e)return 'missing';const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return 'hidden';
 const x=r.left+r.width/2,y=r.top+r.height/2;if(x<0||y<0||x>innerWidth||y>innerHeight)return 'offscreen '+[x,y].map(Math.round);
 const h=document.elementFromPoint(x,y);return (h===e||e.contains(h))?'ok':'covered by '+(h&&(h.id||h.className||h.tagName))})"""
async def main():
  t=T('layout')
  async with async_playwright() as p:
    for name,w,h in SIZES:
      mobile=name!='desktop'
      dev=dict(viewport={'width':w,'height':h},device_scale_factor=2 if mobile else 1,is_mobile=mobile,has_touch=mobile,user_agent='Mozilla/5.0 (Linux; Android 14; Pixel 7) Mobile' if mobile else 'Mozilla/5.0 (X11; Linux x86_64)')
      b,c,pg,errs=await page(p,dev=dev);E=pg.evaluate
      if name=='landscape-phone':
        t.chk('landscape phone: asks you to turn the phone upright',await pg.is_visible('#rotate'));await pg.screenshot(path='../screenshots/layout_landscape.png');await b.close();continue
      else:t.chk(f'{name}: no rotate overlay in this orientation',not await pg.is_visible('#rotate'))
      await E("JD.save.tut=1;JD.persist()")
      over=[]
      for s in SCREENS:
        await E(f"JD.go('{s}')");await pg.wait_for_timeout(120)
        r=await E("[document.documentElement.scrollWidth,innerWidth,Math.max(...[...document.querySelectorAll('.screen:not(.hidden) *')].map(e=>e.getBoundingClientRect().right))]")
        if r[0]>r[1]+1 or r[2]>r[1]+1:over.append((s,r))
        back=await E(f"[...document.querySelectorAll('#s{s[0].upper()+s[1:]} .btn')].map(e=>e.id||e.textContent.trim()).slice(-1)[0]||''")
      t.chk(f'{name}: no sideways overflow on any menu screen',not over,over)
      await E("JD.go('menu')");await pg.wait_for_timeout(100)
      r=await E("[...document.querySelectorAll('#sMenu button')].map(b=>{const r=b.getBoundingClientRect();return [b.textContent.trim().slice(0,12),Math.round(r.bottom),Math.round(r.height)]})")
      t.chk(f'{name}: every main menu button is fully on screen and >= 40 px tall',all(x[1]<=h and x[2]>=40 for x in r),r)
      for s,sel in [('settings','#bSetBack'),('chal','#sChal .btn:last-child'),('unlocks','#sUnlocks .btn:last-child'),('ach','#sAch .btn:last-child')]:
        await E(f"JD.go('{s}')");await pg.wait_for_timeout(100)
        v=await E(VIS,sel);t.chk(f'{name}: {s} back button reachable',v=='ok',v)
      # play
      await E("JD.start('quick')");await pg.wait_for_timeout(900)
      await E("JD.select(WD.live().filter(o=>WD.vis(o)>.9)[0])");await pg.wait_for_timeout(200)
      res={sel:await E(VIS,sel) for sel in ['#bPause','#bGive','#bRotL','#bRotR','#bTray','#ask']}
      t.chk(f'{name}: play HUD and action buttons visible and uncovered',all(v=='ok' for v in res.values()),res)
      g=await E("(()=>{const hud=document.getElementById('hud').getBoundingClientRect(),bar=document.getElementById('bar').getBoundingClientRect();const tl=RD.toScreen(-8,-8),br=RD.toScreen(WD.W+8,474+68+8),s0=RD.toScreen(...WD.slotPos(0)),s1=RD.toScreen(...WD.slotPos(1));return {hudB:hud.bottom,barT:bar.top,top:tl[1],bot:br[1],left:tl[0],right:br[0],slot:s1[0]-s0[0],scale:RD.s,W:innerWidth}})()")
      t.chk(f'{name}: drawer sits below the HUD and the tray above the action bar',g['top']>=g['hudB']-1 and g['bot']<=g['barT']+1 and g['left']>=0 and g['right']<=g['W'],g)
      need=36 if h<600 else 44
      t.chk(f'{name}: tray slots are thumb sized (>= {need} px apart)',g['slot']>=need,round(g['slot']))
      sc=await E("WD.live().map(o=>[Math.max(o.d.w,o.d.h)*RD.s,(Math.min(o.d.w,o.d.h)+10)*RD.s,o.d.id]).sort((a,b)=>a[1]-b[1])[0]")
      fat=await E("Math.max(0,11/RD.s-5)")
      band=sc[1]+2*fat*await E("RD.s")
      t.chk(f'{name}: thinnest object still has a usable touch band (>= 20 px wide counting the grab margin, >= 18 px long)',band>=20 and sc[0]>=18,sc,round(band,1))
      if name=='320x568':
        o=await E("(()=>{const S=BOT.scene([['screw',156,200,0],['house_key',60,380,0]]);const o=S[0];const dy=o.d.h/2+5+Math.max(0,11/RD.s-5)*.8;return [o.uid,RD.toScreen(o.x,o.y+dy),WD.pick(o.x,o.y+dy)===null]})()")
        t.chk('320x568: the test tap point really is outside the screw (plus its normal grab margin)',o[2],o)
        if o:
          tc=await Touch(pg).init();await tc.tap(o[1]);await pg.wait_for_timeout(150)
          t.chk('320x568: a tap just beside a small thing still picks it',await E(f"JD.sel&&JD.sel.uid=={o[0]}"),o)
          await E("JD.select(null)")
      await E("JD.select(null)");await pg.wait_for_timeout(250)
      await pg.screenshot(path=f'../screenshots/layout_{name}.png')
      t.chk(f'{name}: no console errors',not errs,errs);errs.clear()
      await b.close()
  t.done([])
asyncio.run(main())
