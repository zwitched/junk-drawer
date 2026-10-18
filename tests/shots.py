# Takes the gallery screenshots at 390x844 (Pixel 7 emulation).
from util import *
async def main():
  async with async_playwright() as p:
    b,c,pg,errs=await page(p,dev=dict(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True));E=pg.evaluate
    S='../screenshots/'
    await pg.wait_for_timeout(600);await pg.screenshot(path=S+'title.png')
    await E("JD.save.tut=1;JD.persist();JD.go('menu')");await pg.wait_for_timeout(200);await pg.screenshot(path=S+'menu.png')
    await E("JD.go('modes')");await pg.wait_for_timeout(200);await pg.screenshot(path=S+'modes.png')
    await E("JD.start('cleanout',{i:16})");await pg.wait_for_timeout(1400)
    await E("JD.M.time=JD.C?JD.M.time:JD.M.time");await pg.screenshot(path=S+'gameplay_buried.png')
    print('gameplay req:',await pg.text_content('#ask'),await E("(()=>{const r=JD.M.req;return WD.objs.filter(o=>!o.gone&&LV.matchSlot(r.slots[0],o)).map(o=>+WD.vis(o).toFixed(2))})()"))
    await E("JD.pause()");await pg.wait_for_timeout(250);await pg.screenshot(path=S+'pause.png')
    await E("JD.save.stats.found=12;JD.save.stats.bestStreak=6;JD.save.stats.broken=1;JD.save.ach={first:1,streak5:1,crunch:1,hidden:1,combo:1,three:1};JD.go('ach')");await pg.wait_for_timeout(200);await pg.screenshot(path=S+'achievements.png')
    await E("JD.go('settings')");await pg.wait_for_timeout(200);await pg.screenshot(path=S+'settings.png')
    await E("JD.intro(0)");await pg.wait_for_timeout(200);await pg.screenshot(path=S+'challenge_intro.png')
    for i,nm in [(6,'magnet'),(8,'tangle')]:
      await E(f"JD.start('cleanout',{{i:{i}}})");await pg.wait_for_timeout(1500)
      print(nm,await pg.text_content('#ask'),await E("[WD.objs.filter(o=>o.mag).length,WD.tangles.length]"))
      await pg.screenshot(path=S+nm+'.png')
    await b.close();print('errors',errs)
asyncio.run(main())
