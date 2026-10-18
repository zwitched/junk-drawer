# Served over http: manifest + icons load, service worker installs and the game still loads offline.
# Also checks the single-file dist/index.html boots from disk and plays.
from util import *
import subprocess,socket,time,urllib.request
def free():
  s=socket.socket();s.bind(('127.0.0.1',0));p=s.getsockname()[1];s.close();return p
async def main():
  t=T('http');port=free()
  srv=subprocess.Popen([sys.executable,'-m','http.server',str(port),'--bind','127.0.0.1'],cwd=str(ROOT),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(.8)
  base=f'http://127.0.0.1:{port}/'
  try:
    m=json.loads(urllib.request.urlopen(base+'manifest.webmanifest').read())
    t.chk('manifest is valid JSON with name, standalone, portrait and icons',m['name']=='Junk Drawer' and m['display']=='standalone' and m['orientation']=='portrait' and len(m['icons'])==2)
    for ic in m['icons']:t.chk('icon serves: '+ic['src'],urllib.request.urlopen(base+ic['src']).status==200)
    async with async_playwright() as p:
      b,c,pg,errs=await page(p,url=base)
      await pg.wait_for_function("navigator.serviceWorker.ready.then(()=>true)",timeout=10000)
      await pg.reload();await pg.wait_for_timeout(800)
      t.chk('service worker controls the page after a reload',await pg.evaluate("!!navigator.serviceWorker.controller"))
      await c.set_offline(True);await pg.reload();await pg.wait_for_timeout(1000)
      t.chk('offline reload still loads the game',await pg.is_visible('#bPlay') and await pg.evaluate("typeof JD==='object'&&OBJ.LIST.length>=35"))
      await pg.add_script_tag(content=BOT)
      await pg.evaluate("JD.save.tut=1;JD.start('quick')");await pg.wait_for_timeout(900)
      t.chk('offline: a round starts with a request',len(await pg.text_content('#ask'))>5)
      await c.set_offline(False);await b.close()
      reqs=[]
      b,c,pg,errs2=await page(p,url='file://'+str(ROOT/'dist/index.html'))
      pg.on('request',lambda r:reqs.append(r.url))
      await pg.reload();await pg.wait_for_timeout(500);await pg.add_script_tag(content=BOT)
      t.chk('dist: loads nothing but itself',all(u.endswith('dist/index.html') or u.startswith('data:') for u in reqs),reqs[:5])
      t.chk('dist/index.html (single file) boots from disk',await pg.is_visible('#bPlay') and await pg.evaluate("OBJ.LIST.length")>=35)
      await pg.evaluate("JD.save.tut=1;JD.start('quick')");await pg.wait_for_timeout(900)
      r=await pg.evaluate("(()=>{const tg=WD.objs.find(o=>!o.gone&&LV.matchSlot(JD.M.req.slots[0],o));JD.submit(tg);BOT.run(1);return SC.finds})()")
      t.chk('dist: a find works',r==1)
      errs+=errs2;await b.close()
  finally:srv.terminate()
  t.done(errs)
asyncio.run(main())
