import asyncio,pathlib,json,re,sys
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
URL='file://'+str(ROOT/'index.html')
BOT=(ROOT/'tests/bot.js').read_text()
class T:
  def __init__(s,name):s.name=name;s.bad=[];s.n=0
  def chk(s,label,ok,*info):
    s.n+=1;print(('PASS ' if ok else 'BAD  ')+label,*[json.dumps(i,default=str)[:300] for i in info],flush=True)
    if not ok:s.bad.append(label)
  def done(s,errs):
    print('ERRORS',errs if errs else 'none');print(f'SUMMARY {s.name}: {s.n-len(s.bad)}/{s.n} passed',flush=True)
    if errs or s.bad:sys.exit(1)
async def page(p,dev='Pixel 7',url=URL,clear=True,ctx_kw=None):
  b=await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
  kw=dict(p.devices[dev]) if isinstance(dev,str) else dict(dev)
  if ctx_kw:kw.update(ctx_kw)
  c=await b.new_context(**kw);pg=await c.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  await pg.goto(url);await pg.wait_for_timeout(500)
  if clear:
    await pg.evaluate("localStorage.clear()");await pg.reload();await pg.wait_for_timeout(500)
  await pg.add_script_tag(content=BOT)
  return b,c,pg,errs
async def ws(pg,x,y):
  return await pg.evaluate(f"RD.toScreen({x},{y})")
class Touch:
  def __init__(s,pg):s.pg=pg;s.cdp=None
  async def init(s):s.cdp=await s.pg.context.new_cdp_session(s.pg);return s
  async def send(s,kind,pts):await s.cdp.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[{'x':x,'y':y,'id':i} for i,(x,y) in pts]})
  async def drag(s,a,b,steps=12,hold=0,dt=16):
    await s.send('touchStart',[(0,a)])
    if hold:await s.pg.wait_for_timeout(hold)
    for k in range(1,steps+1):
      t=k/steps;await s.send('touchMove',[(0,(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))]);await s.pg.wait_for_timeout(dt)
    await s.pg.wait_for_timeout(60);await s.send('touchEnd',[])
  async def tap(s,a,hold=40):
    await s.send('touchStart',[(0,a)]);await s.pg.wait_for_timeout(hold);await s.send('touchEnd',[])
