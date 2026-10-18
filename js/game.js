// Game state machine, modes (Quick Rummage, Big Cleanout, Bottomless, Daily, Just Fiddling, Tutorial),
// request flow, interaction handlers, main loop and boot.
(function(){
const $=UI.$;
const JD=window.JD={state:'boot',save:PG.load(),sel:null,M:null,pointer:null,dirty:1,silent:0,
 FONT:'"Segoe Print","Bradley Hand","Chalkboard SE","Noteworthy","Comic Sans MS",system-ui,sans-serif'};
const ST=()=>JD.save.stats;
JD.persist=()=>PG.save(JD.save);
JD.applySettings=function(){const s=JD.save.set;AU.setSfx(s.sfx);AU.setMusic(s.music);document.body.classList.toggle('nomotion',!s.motion);};
// ---------- screens ----------
JD.go=function(name){JD.state=name;UI.show(name==='play'?null:name);const play=name==='play';
 $('hud').classList.toggle('hidden',!(play||name==='pause'));$('bar').classList.toggle('hidden',!play);
 document.body.dataset.s=name;if(name==='results')$('toasts').innerHTML='';
 if(!play){IN.cancelAll();$('inspect').classList.add('hidden');}
 $('tut').classList.toggle('hidden',!(play&&JD.M&&JD.M.kind==='tutorial'&&$('tut').innerHTML));
 if(name==='modes')UI.modes();if(name==='chal')UI.chal();if(name==='settings')UI.settings();if(name==='ach')UI.ach();if(name==='unlocks')UI.unlocks();if(name==='stats')UI.stats();
 if(name!=='play'&&name!=='pause'&&name!=='results'&&name!=='settings'&&name!=='confirm'&&JD.M&&!JD.M.ended){JD.M.ended=true;}
 layout();JD.dirty=1;};
function layout(){let top=10,bot=innerHeight-10;const play=JD.state==='play'||JD.state==='pause';
 if(play){top=$('hud').getBoundingClientRect().bottom+4;bot=$('bar').getBoundingClientRect().top;}
 RD.resize({x:4,y:top,w:innerWidth-8,h:Math.max(120,bot-top)});JD.dirty=1;}
JD.layout=layout;
JD.chalOpen=i=>i===0||!!(JD.save.chal[i-1]&&JD.save.chal[i-1].stars>0)||!!JD.save.chal[i];
JD.intro=function(i){JD.introI=i;UI.intro(i);JD.go('intro');};
// ---------- timers on game time (freeze while paused) ----------
JD.after=function(t,f){if(JD.M)JD.M.timers.push({t,f});};
// ---------- start a mode ----------
JD.start=function(kind,opt){opt=opt||{};AU.unlock();JD.select(null);JD.pointer=null;UI.tut(null);IN.cancelAll();
 const s=JD.save;const M=JD.M={kind,opt,t:0,reqT:0,req:null,timers:[],recent:[],finds:0,busy:true,ended:false,locked:true,hintPulse:0,unl:[],time:null,breaks:0};
 SC.reset();JD.silent=1;LV.cap=null;RD.fx.length=0;RD.flights.length=0;
 if(kind==='quick'){M.R=RNG.make((Date.now()*7919)>>>0);M.avail=LV.availDefs(PG.colls(s));M.time=60;M.d=0;LV.build({R:M.R,avail:M.avail,count:30,rare:.12});s.stats.quickPlays++;}
 else if(kind==='bottomless'){M.R=RNG.make((Date.now()*104729)>>>0);M.avail=LV.availDefs(PG.colls(s));M.depth=0;M.strikes=3;M.d=0;LV.build({R:M.R,avail:M.avail,count:28,rare:.12});s.stats.bottomlessPlays++;}
 else if(kind==='cleanout'){const i=opt.i,C=LV.CHALLENGES[i];M.C=C;M.i=i;M.R=RNG.make('cleanout-'+i);M.avail=OBJ.base;M.queue=C.reqs.map(sp=>LV.makeReq(sp,M.R,M.avail));
  LV.build({R:M.R,avail:M.avail,count:C.count,reqs:M.queue,fragile:C.fragile,include:C.include,magnets:C.magnets,tangles:C.tangles,rare:.06});M.time=C.time;M.dis=C.disasters||null;M.every=C.every||20;M.nextDis=(C.every||20)*.7;}
 else if(kind==='daily'){M.day=opt.day||RNG.today();const d=JD.dailySetup(M.day);M.R=d.R;M.avail=d.avail;M.queue=d.reqs;M.time=150;M.dis=['roll','slam','spring'];M.every=26;M.nextDis=20;}
 else if(kind==='tutorial'){M.R=RNG.make(5);M.avail=OBJ.base;setupTutorial(M);}
 else if(kind==='free'){M.R=RNG.make((Date.now()*31)>>>0);M.avail=LV.availDefs(PG.colls(s));LV.build({R:M.R,avail:M.avail,count:36,include:['spring','rubber_band','glasses'],magnets:[{m:'horseshoe_magnet',near:['screw','paperclip','house_key']}],tangles:[['cable','spoon',3]],rare:.3});}
 JD.silent=0;if(kind!=='tutorial'&&kind!=='free')s.stats.rounds++;
 UI.resetHud();UI.noteText('','Opening the drawer...');$('timerBar').classList.add('hidden');JD.go('play');
 const cv=$('cv');cv.classList.remove('opening');void cv.offsetWidth;cv.classList.add('opening');AU.drawer();HAP(12);
 JD.after(.45,()=>{M.locked=false;if(kind==='tutorial')tutStep(0);else JD.nextReq();});
 JD.persist();};
// the daily drawer: everything comes from the date seed
JD.dailySetup=function(day){const R=RNG.make('daily-'+day),avail=OBJ.base;
 const named=avail.filter(d=>d.req.length&&!d.tangler&&!d.magnet&&!d.fragile);const pickId=()=>R.pick(named).id;
 const tags=Object.keys(LV.MYST).filter(t=>avail.some(a=>a.tags.includes(t)&&!a.tags.includes('dead')));
 const combos=Object.keys(LV.COMBOS).filter(c=>LV.COMBOS[c].s.every(s=>s.tag?avail.some(a=>a.tags.includes(s.tag)):avail.some(a=>a.id===s.id)));
 const specs=[{id:pickId(),bury:1},{decoy:R.pick(Object.keys(LV.DECOYS))},{tag:R.pick(tags)},{id:pickId(),bury:3},{combo:R.pick(combos)},{id:pickId(),bury:2}];
 const reqs=specs.map(sp=>LV.makeReq(sp,R,avail));
 LV.build({R,avail,count:34,reqs,include:['spring'],tangles:[['cable',specs[0].id,2]],magnets:[{m:'horseshoe_magnet',near:['screw','paperclip']}]});
 return{R,reqs,avail};};
// ---------- requests ----------
function matching(slot){return WD.objs.filter(o=>!o.gone&&LV.matchSlot(slot,o));}
function reqVis(r){let tot=0;r.slots.forEach(sl=>{let best=0;for(const o of matching(sl))best=Math.max(best,o.tray>=0?1:WD.vis(o));tot+=best;});return tot/r.slots.length;}
JD.ensureReq=function(r){const M=JD.M;const cnt={};
 for(const sl of r.slots){if(sl.id)cnt[sl.id]=(cnt[sl.id]||0)+1;else if(!matching(sl).length)LV.hideUnder(M.R.pick(M.avail.filter(a=>a.tags.includes(sl.tag)&&!a.tags.includes('dead'))),M.R,1);}
 for(const id in cnt){let n=cnt[id]-matching({id}).length;while(n-->0)LV.hideUnder(OBJ.DEFS[id],M.R,1);}};
// long endless rounds: quietly drop things that are completely buried at the bottom so the pile never grows without end
function cull(){if(!LV.cap)return;const L=WD.live().filter(o=>o.tray<0&&!o.held&&!o.mag&&!o.tang&&!o.d.magnet&&!o.d.rare&&!WD.objs.some(q=>q.mag===o));
 const extra=WD.live().length-LV.cap+6;if(extra<=0)return;L.sort((a,b)=>a.z-b.z);let n=0;for(const o of L){if(n>=extra)break;if(WD.vis(o)<.04){WD.remove(o);n++;}}}
JD.nextReq=function(){const M=JD.M;if(!M||M.ended)return;cull();
 if(M.kind==='free'){UI.noteText('','Nobody needs anything. Enjoy it while it lasts.');M.busy=true;return;}
 let r;if(M.queue){r=M.queue.shift();if(!r){JD.finish(true);return;}}
 else r=LV.pickReq(M.d,M.R,M.avail,M.recent);
 JD.ensureReq(r);
 M.req=r;M.reqT=0;M.busy=false;r.hintT=0;r.vis0=reqVis(r);
 r.slots.forEach(sl=>{if(sl.id)M.recent.push(sl.id);});M.recent=M.recent.slice(-4);
 if(M.kind==='bottomless'){M.reqMax=Math.max(18,46-M.depth*1.2)+(r.slots.length-1)*10;M.reqLeft=M.reqMax;}
 UI.note(r);fitNote();AU.page();};
function fitNote(){const n=$('note'),a=$('ask');let fs=innerHeight<620?16:19;a.style.fontSize=fs+'px';while(n.scrollHeight>n.clientHeight+1&&fs>12){fs--;a.style.fontSize=fs+'px';}}
JD.fitNote=fitNote;
let lastPos={x:WD.W/2,y:WD.H/2};
JD.submit=function(o){const M=JD.M;if(!M||M.ended||!o||o.gone)return false;
 if(o.d.rare){JD.oddity(o);SC.bonus(150);RD.pop(o.x,o.y,'+150','#8a5a10',1);JD.collectObj(o);AU.collect();return true;}
 const r=M.req;if(!r||M.busy){UI.toast(M.kind==='free'?'Nobody asked for anything. Keep it.':'Hang on, nobody has asked yet.');return false;}
 const i=LV.match(r,o);
 if(i>=0){r.filled[i]=o.d.id;if(o.broken)r.cracked=1;if(o.d.id==='shed_key')ST().shed++;lastPos={x:o.tray>=0?WD.slotPos(o.tray)[0]:o.x,y:o.tray>=0?WD.slotPos(o.tray)[1]-30:o.y};JD.collectObj(o);
  if(r.filled.every(Boolean))JD.complete();else{AU.collect();HAP(10);UI.slots(r);RD.pop(lastPos.x,lastPos.y,r.filled.filter(Boolean).length+' of '+r.slots.length,'#2f7a4b');}
  return true;}
 JD.wrong(o);return false;};
JD.collectObj=function(o){const nr=$('note').getBoundingClientRect();if(o.tray>=0){const p=WD.slotPos(o.tray);o.x=p[0];o.y=p[1];}
 RD.flight(o,nr.left+nr.width*.82,nr.top+nr.height*.5);RD.burst(o.x,o.y);if(JD.sel===o)JD.select(null);WD.remove(o);};
const STAMPS=['GOT IT','FOUND','THANKS','THERE IT IS'];
JD.complete=function(){const M=JD.M,r=M.req,st=ST();M.busy=true;
 if(M.kind==='tutorial'){AU.correct(1);HAP([12,40,18]);UI.stamp('GOT IT');RD.pop(lastPos.x,lastPos.y,'Nice.','#2f7a4b',1);st.found++;JD.after(.8,()=>tutStep(3));return;}
 const clean=r.mistakes===0&&!r.cracked;const b=SC.find(M.reqT,r.vis0,clean,r.slots.length);M.finds++;
 st.found+=r.slots.length;if(r.vis0<.4)st.hidden++;if(r.vis0<.08)st.deep++;if(r.kind==='combo')st.combos++;if(r.kind==='mystery')st.mystery++;if(r.kind==='decoy')st.decoys++;
 st.bestStreak=Math.max(st.bestStreak,SC.streak);st.fastest=Math.min(st.fastest,Math.round(M.reqT*100)/100);
 AU.correct(SC.streak);if(r.slots.length>1)setTimeout(()=>AU.combo(r.slots.length),120);HAP([12,40,18]);
 RD.pop(lastPos.x,lastPos.y,'+'+UI.fmt(b.total),'#2f7a4b',1);
 let y=lastPos.y+26;if(b.hidden){RD.pop(lastPos.x,y,b.hidden>60?'Dug it out':'Buried','#8a5a10');y+=22;}if(b.speed>=90){RD.pop(lastPos.x,y,'Quick','#8a5a10');}
 if(SC.streak>=5&&SC.streak%5===0)UI.banner(SC.streak+' in a row');
 UI.stamp(STAMPS[(Math.random()*STAMPS.length)|0]);
 if(M.kind==='quick'){const add=4+(r.slots.length-1)*3;M.time+=add;RD.pop(WD.W-40,6,'+'+add+'s','#2f7a4b');M.d=Math.floor(M.finds/2);}
 if(M.kind==='bottomless'){M.depth++;M.d=Math.floor(M.depth/3);if(M.depth%5===0){UI.banner('Depth '+M.depth);for(let i=0;i<4&&WD.live().length<60;i++)LV.toss(LV.clutterDef(M.R,M.avail.filter(d=>!d.tangler&&!d.magnet)),M.R);}}
 JD.checkUnlocks();
 JD.after(.75,()=>{if(M.ended)return;refill();JD.nextReq();});};
const RUDE=["Never mind. I'll find it myself.","Forget it. I'll buy a new one.","I've stopped needing it.","It's fine. I'll use my teeth."];
JD.wrong=function(o){const M=JD.M,r=M.req;r.mistakes++;const p=SC.wrong();ST().wrong++;o.wob=.5;AU.wrong();HAP([35,40,35]);
 let line=r.wrong&&r.wrong[o.d.id];if(!line)line=LV.WRONG[(Math.random()*LV.WRONG.length)|0].replace('{n}',o.d.n);UI.reply(line);
 const px=o.tray>=0?WD.slotPos(o.tray)[0]:o.x,py=o.tray>=0?WD.slotPos(o.tray)[1]-30:Math.max(20,o.y);RD.pop(px,py,p?'-'+p:'Nope','#c8392e');
 if(M.kind==='quick'){M.time=Math.max(0,M.time-3);RD.pop(px,py+22,'-3s','#c8392e');}
 if(M.kind==='bottomless')M.reqLeft=Math.max(1,M.reqLeft-4);
 JD.select(null);};
function refill(){const M=JD.M;if(M.kind!=='quick'&&M.kind!=='bottomless')return;
 const target=M.kind==='quick'?Math.min(30+M.finds,50):Math.min(28+Math.round(M.depth*1.2),54);
 LV.cap=target+6;const room=()=>WD.live().length<target;
 let n=Math.min(3,target-WD.live().length);const pool=M.avail.filter(d=>!d.tangler&&!d.magnet);
 for(let i=0;i<n;i++)LV.toss(LV.clutterDef(M.R,pool),M.R);
 if(M.d>=1&&room()&&M.R()<.22){const f=M.avail.filter(d=>d.fragile);LV.toss(M.R.pick(f),M.R);}
 if(M.R()<.05&&!WD.objs.some(o=>o.d.rare))LV.hideUnder(M.R.pick(OBJ.rares),M.R,2);
 if(M.d>=3&&!M.dis){M.dis=['roll','slam','spring','snap'];M.every=M.kind==='quick'?18:24;M.nextDis=M.t+8;}
 if(M.dis&&room()&&M.R()<.3&&!WD.live().some(o=>o.d.id==='spring'))LV.toss(OBJ.DEFS.spring,M.R);}
// ---------- interaction handlers (called by input) ----------
JD.select=function(o){if(JD.sel&&JD.sel!==o&&!JD.sel.held)JD.sel.tl=0;JD.sel=o||null;if(o&&o.tray<0&&!o.held)o.tl=.22;UI.bar(!!o,o);JD.dirty=1;};
JD.touchObj=function(o){AU.tap(o.d.mat,true);HAP(5);};
JD.tapObj=function(o){if(JD.state!=='play')return;$('inspect').classList.add('hidden');if(JD.sel===o){JD.submit(o);return;}JD.select(o);if(o.d.rare)JD.oddity(o);};
JD.tapEmpty=function(){JD.select(null);$('inspect').classList.add('hidden');};
JD.dragStart=function(o){ST().moved++;if(JD.sel&&JD.sel!==o)JD.select(null);AU.tap(o.d.mat);HAP(8);$('inspect').classList.add('hidden');JD.dirty=1;};
JD.dragEnd=function(o,speed){if(o.mag){o.snap=0;o.sx=o.x;o.sy=o.y;}if(speed>380)AU.slide(speed);if(JD.sel===o)o.tl=.22;};
JD.dropOnNote=function(o){const ok=JD.submit(o);if(!ok&&!o.gone){WD.release(o,0,260);}};
JD.toTray=function(o){const r=WD.toTray(o);if(r==='full'){UI.toast("The tray's full.");return r;}if(r==='tangled'){UI.toast('Untangle it first.');return r;}
 AU.tray();HAP(8);ST().trayed++;if(WD.tray.every(Boolean))ST().trayFull++;if(JD.sel===o)UI.bar(true,o);JD.checkUnlocks();return r;};
JD.trayButton=function(){const o=JD.sel;if(!o)return;if(o.tray>=0){const M=JD.M;WD.fromTray(o,40+Math.random()*(WD.W-80),40+Math.random()*80);o.landing=1;o.lift=.6;AU.tray();JD.select(o);return;}
 if(o.mag){UI.toast("It's stuck to the magnet. Drag it off first.");return;}JD.toTray(o);};
JD.rotateSel=function(dir,amt){const o=JD.sel;if(!o||o.tray>=0)return;if(o.mag){UI.toast("It's stuck to the magnet.");return;}const t=o.tang&&o.tang.b===o?o.tang.a:o;
 t.tr=(t.tr!==null?t.tr:t.r)+dir*(amt||Math.PI/4);AU.tap('wood',true);HAP(5);};
JD.setRot=function(o,r){if(o.mag)return;const t=o.tang&&o.tang.b===o?o.tang.a:o;if(t===o)o.r=r;else{const d=r-o.r;t.r+=d;}};
JD.knotTap=function(t,shaken){if(JD.state!=="play"||!t||t.k<=0||!WD.tangles.includes(t))return;WD.tugKnot(t);AU.knot();HAP(10);ST().knots++;JD.checkUnlocks();};
JD.unstick=function(o){o.mag=null;o.immune=WD.t+1.5;AU.unstick();HAP(15);ST().unstuck++;JD.checkUnlocks();};
JD.inspect=function(o){ST().inspected++;o.insp=o.insp||0;const line=o.d.desc[o.insp%o.d.desc.length];o.insp++;UI.inspect(o,line);AU.tap(o.d.mat,true);HAP(12);o.wob=.15;if(o.d.rare)JD.oddity(o);if(JD.M)JD.M.inspected=true;JD.checkUnlocks();};
JD.oddity=function(o){if(o.found)return;o.found=1;const st=ST();if(!st.oddities.includes(o.d.id))st.oddities.push(o.d.id);AU.oddity();UI.toast('Huh. A '+o.d.n+'. That goes in the collection.','ach');JD.checkUnlocks();};
JD.checkUnlocks=function(){const u=PG.check(JD.save);for(const x of u){UI.toast(x.type==='ach'?'Achievement: <b>'+x.n+'</b>':x.type==='design'?'New drawer unlocked: <b>'+x.n+'</b>':'New objects in the drawer: <b>'+x.n+'</b>','ach');if(JD.M)JD.M.unl.push(x);}if(u.length)JD.persist();};
WD.on((type,a,b)=>{if(JD.silent)return;
 if(type==='land'){AU.land(a.d.mat,a.d.wt);if(a.d.wt>=2)HAP(6);}
 else if(type==='knock')AU.knock(b.d.mat);
 else if(type==='wall')AU.wall(b);
 else if(type==='stick'){AU.stick();HAP(8);}
 else if(type==='untangle'){AU.untangle();HAP([10,30,20]);RD.pop(a.x,a.y-20,'Loose!','#2f7a4b');}
 else if(type==='break'){AU.crack();HAP([20,30,60]);if(JD.M&&!JD.M.ended&&JD.M.kind!=='free'&&JD.M.kind!=='tutorial'){const p=SC.broke();JD.M.breaks++;RD.pop(a.x,a.y,p?'Crunch. -'+p:'Crunch.','#c8392e');if(JD.M.req)JD.M.req.mistakes++;}else RD.pop(a.x,a.y,'Crunch.','#c8392e');ST().broken++;JD.checkUnlocks();}
 else if(type==='disaster'){AU.rumble();HAP([40,30,40]);const t={roll:b?'The '+b.d.n+' is rolling away.':'Something is rolling.',spring:'The spring went off.',snap:'A rubber band snapped.',slam:'Somebody bumped the drawer.'}[a];UI.toast(t,'bad');}});
// ---------- per-frame mode logic ----------
function update(dt){const M=JD.M;if(!M)return;
 for(let i=M.timers.length-1;i>=0;i--){const t=M.timers[i];t.t-=dt;if(t.t<=0){M.timers.splice(i,1);t.f();}}
 if(M.ended||M.locked)return;M.t+=dt;ST().time+=dt;
 if(M.req&&!M.busy)M.reqT+=dt;
 if(M.time!==null&&(M.kind==='quick'||M.kind==='cleanout'||M.kind==='daily')){M.time-=dt;if(M.time<=5.5&&M.time>0&&Math.ceil(M.time)!==M.lastTick){M.lastTick=Math.ceil(M.time);AU.tick();}if(M.time<=0){M.time=0;JD.finish(M.kind==='quick');return;}}
 if(M.kind==='bottomless'&&M.req&&!M.busy){M.reqLeft-=dt;if(M.reqLeft<=5.5&&Math.ceil(M.reqLeft)!==M.lastTick){M.lastTick=Math.ceil(M.reqLeft);AU.tick();}
  if(M.reqLeft<=0){M.strikes--;M.busy=true;SC.streak=0;AU.wrong();HAP([60,40,60]);UI.reply(RUDE[(Math.random()*RUDE.length)|0]);if(M.strikes<=0){JD.after(.9,()=>JD.finish(false));}else JD.after(1.3,()=>{if(!M.ended)JD.nextReq();});}}
 if(M.dis&&M.t>M.nextDis&&!M.busy&&!WD.held){M.nextDis=M.t+M.every*(.8+M.R()*.5);for(const k of M.R.shuffle(M.dis.slice()))if(WD.disaster(k,M.R))break;}
 // gentle hints: wiggle what's on top of the target, then glow the target itself
 if(JD.save.set.hints&&M.req&&!M.busy&&M.kind!=='tutorial'){const r=M.req;r.hintT+=dt;if(r.hintT>12){M.hintPulse-=dt;if(M.hintPulse<=0){M.hintPulse=2.4;const sl=r.slots[r.filled.findIndex(f=>!f)];
  if(sl){let best=null,bv=-1;for(const o of matching(sl)){if(o.tray>=0){best=null;break;}const v=WD.vis(o);if(v>bv){bv=v;best=o;}}
   if(best){if(best.mag){best.mag.wob=.3;best.hint=1.2;}else if(best.tang){best.tang.pulse=.3;best.hint=1.2;}else if(bv<.45){const c=WD.coverers(best)[0];if(c){c.wob=.35;c.hint=1.2;}}else if(r.hintT>18)best.hint=1.6;}}}}}
 // warn when something heavy is carried over glass
 const h=WD.held;if(h&&h.d.wt>=2){for(const o of WD.objs){if(o.d.fragile&&!o.broken&&o!==h&&o.tray<0&&!o.gone&&WD.overlap(h,o))o.warn=.15;}}
 if(M.kind==='tutorial')tutCheck();}
function hud(){const M=JD.M;if(!M)return;const k=M.kind;
 UI.hud({score:SC.score,mult:k==='tutorial'||k==='free'?1:SC.mult(),clock:(k==='quick'||k==='cleanout'||k==='daily')?M.time:k==='bottomless'?(M.reqLeft!=null?M.reqLeft:null):null,strikes:k==='bottomless'?M.strikes:null,bar:k==='bottomless'&&M.req&&M.reqMax?M.reqLeft/M.reqMax:null});
 $('scoreBox').style.visibility=(k==='tutorial'||k==='free')?'hidden':'visible';}
// ---------- end of a round ----------
JD.finish=function(win){const M=JD.M;if(!M||M.ended)return;M.ended=true;IN.cancelAll();JD.select(null);const s=JD.save,st=s.stats;
 const res={title:'',score:0,lines:[],unlocks:[],buttons:[],stars:null,best:null,newBest:false};
 const base=[['Things found',SC.finds],['Longest streak',SC.best],['Found while buried',SC.hiddenFinds],['Wrong picks',SC.mistakes],['Breakages',SC.breaks]];
 if(M.kind==='quick'){res.title="Time's up.";res.lines=base;res.newBest=SC.score>s.best.quick;res.best=s.best.quick;s.best.quick=Math.max(s.best.quick,SC.score);
  res.buttons=[['Again',()=>JD.start('quick'),'primary','bAgain'],['Menu',()=>JD.go('menu'),'','bMenu']];}
 else if(M.kind==='bottomless'){res.title='Out of patience.';res.lines=[['Depth reached',M.depth]].concat(base);res.newBest=SC.score>s.best.bottomless||M.depth>s.best.depth;res.best=s.best.bottomless;s.best.bottomless=Math.max(s.best.bottomless,SC.score);s.best.depth=Math.max(s.best.depth,M.depth);
  res.buttons=[['Again',()=>JD.start('bottomless'),'primary','bAgain'],['Menu',()=>JD.go('menu'),'','bMenu']];}
 else if(M.kind==='cleanout'){const C=M.C,i=M.i,used=C.time-M.time;
  if(win){const tb=SC.bonus(Math.round(M.time)*10);const stars=1+(used<=C.par?1:0)+(used<=C.par&&SC.mistakes===0&&SC.breaks===0?1:0);res.stars=stars;res.title='Drawer sorted.';
   res.lines=[['Time',UI.clock(used)+' (par '+UI.clock(C.par)+')'],['Time bonus','+'+UI.fmt(tb)]].concat(base);const rec=s.chal[i]||{stars:0,score:0,time:9999};res.newBest=SC.score>rec.score||stars>rec.stars;res.best=rec.score||null;
   s.chal[i]={stars:Math.max(rec.stars,stars),score:Math.max(rec.score,SC.score),time:Math.min(rec.time,Math.round(used))};
   res.buttons=i<19?[['Next',()=>JD.intro(i+1),'primary','bNext'],['Retry',()=>JD.start('cleanout',{i}),'','bRetry'],['List',()=>JD.go('chal'),'','bList']]:[['Retry',()=>JD.start('cleanout',{i}),'primary','bRetry'],['List',()=>JD.go('chal'),'','bList']];}
  else{res.stars=0;res.title='Out of time.';res.lines=[['Requests left',(M.queue?M.queue.length:0)+(M.req&&!M.busy?1:0)]].concat(base);res.buttons=[['Try again',()=>JD.start('cleanout',{i}),'primary','bRetry'],['List',()=>JD.go('chal'),'','bList']];}}
 else if(M.kind==='daily'){if(win){const tb=SC.bonus(Math.round(M.time)*10);res.lines=[['Time bonus','+'+UI.fmt(tb)]].concat(base);st.dailies++;}else res.lines=base;
  res.title=win?'Daily drawer done.':'Out of time.';const prev=s.daily[M.day]||{score:0,done:false};res.newBest=SC.score>prev.score;res.best=prev.score||null;s.daily[M.day]={score:Math.max(prev.score,SC.score),done:prev.done||win};s.best.daily=Math.max(s.best.daily,SC.score);
  res.lines.unshift(['Drawer for',M.day]);res.buttons=[['Again',()=>JD.start('daily',{day:M.day}),'primary','bAgain'],['Menu',()=>JD.go('menu'),'','bMenu']];}
 res.score=SC.score;
 (win||M.kind==='quick')?AU.win():AU.lose();HAP(win?[20,60,20,60,40]:[80]);
 res.unlocks=M.unl.concat(PG.check(s));JD.persist();JD.lastResult=res;
 setTimeout(()=>{if(JD.M!==M)return;UI.results(res);JD.go('results');},900);};
// ---------- tutorial ----------
function setupTutorial(M){WD.reset();const D=OBJ.DEFS;
 const key=WD.add(D.house_key,156,270,.35);WD.add(D.spoon,164,266,-.22);WD.add(D.receipt,132,286,.5);
 const car=WD.add(D.toy_car,86,150,.2);WD.add(D.tape,240,130,0);WD.add(D.comb,220,380,-.6);WD.add(D.button,70,370,0);WD.add(D.pencil,96,226,1.2);WD.add(D.card,262,270,.15);WD.add(D.battery_aa,200,176,2.1);WD.add(D.padlock,268,396,-.3);WD.add(D.eraser,60,300,.4);WD.add(D.cassette,150,404,.1);WD.add(D.clothespin,40,130,-1.3);
 M.tk={key,car};M.tstep=-1;}
function tutStep(n){const M=JD.M;M.tstep=n;const k=M.tk.key;
 const skip='<button class="skip" id="bTutSkip">Skip</button>';
 if(n===0){M.req=LV.makeReq({id:'house_key',text:'Find the spare house key.',who:'Mom'},M.R,M.avail);M.req.vis0=1;M.busy=false;UI.note(M.req);fitNote();AU.page();
  if(WD.vis(k)>.75)return tutStep(1);UI.tut(skip+"Something's on top of the key. Drag it out of the way.");}
 else if(n===1)UI.tut(skip+'There it is. Tap the key to pick it.');
 else if(n===2)UI.tut(skip+'Tap it again to hand it over. You can also drag it up to the note.');
 else if(n===3){UI.noteText('Mom:','Thanks. Now clear some room. Put the toy car in the tray.');M.req=null;M.busy=true;UI.tut(skip+'Drag the toy car down into the tray at the bottom.');}
 else if(n===4){UI.noteText('Mom:',"Have a look at what else is in there.");UI.tut(skip+'Hold your finger on anything to take a closer look.');}
 else if(n===5){JD.pointer=null;JD.save.tut=1;JD.persist();UI.noteText('Mom:',"That's everything. I'll be back with more.");
  UI.tut("That's it. Some things are glass, some are magnets and some get tangled. You'll see.<div class='row'><button class='btn primary' id='bTutGo'>Quick Rummage</button><button class='btn' id='bTutMenu'>Menu</button></div>");
  $('bTutGo').onclick=()=>{AU.ui();JD.start('quick');};$('bTutMenu').onclick=()=>{AU.ui();JD.M.ended=true;UI.tut(null);JD.go('menu');};}
 const sk=$('bTutSkip');if(sk)sk.onclick=()=>{AU.ui();JD.save.tut=1;JD.persist();JD.pointer=null;UI.tut(null);JD.M.ended=true;JD.go('menu');};}
function tutCheck(){const M=JD.M,k=M.tk.key,c=M.tk.car;
 if(M.tstep===0){const cv=WD.coverers(k)[0];JD.pointer=cv?{x:cv.x,y:cv.y}:{x:k.x,y:k.y};if(WD.vis(k)>.75)tutStep(1);}
 else if(M.tstep===1){if(k.gone)return;JD.pointer={x:k.x,y:k.y};if(JD.sel===k)tutStep(2);}
 else if(M.tstep===2){if(!k.gone)JD.pointer={x:k.x,y:k.y};else JD.pointer=null;}
 else if(M.tstep===3){if(c.tray>=0){JD.pointer=null;tutStep(4);}else JD.pointer={x:c.x,y:c.y};}
 else if(M.tstep===4){if(M.inspected)tutStep(5);}}
// ---------- pause ----------
JD.pause=function(){if(JD.state!=='play'||!JD.M||JD.M.ended)return;IN.cancelAll();const M=JD.M;
 $('pauseInfo').textContent={quick:'Quick Rummage',bottomless:'Bottomless Drawer, depth '+(M.depth||0),cleanout:M.C?'No. '+(M.i+1)+': '+M.C.n:'',daily:'Daily Drawer '+M.day,tutorial:'Tutorial',free:'Just Fiddling'}[M.kind];JD.go('pause');AU.stopMusic();};
JD.resume=function(){if(!JD.M||JD.M.ended){JD.go('menu');return;}JD.go('play');AU.resume();if(JD.save.set.music)AU.startMusic();};
// ---------- loop ----------
let last=performance.now(),hudT=0;
JD.tick=function(dt){const M=JD.M,play=JD.state==='play';IN.enabled=!!(play&&M&&!M.locked&&!M.ended);let moving=0;
 if(play){IN.update(dt);moving=WD.step(dt);update(dt);for(const o of WD.objs){if(o.hint>0)o.hint=Math.max(0,o.hint-dt*.6);if(o.warn>0)o.warn=Math.max(0,o.warn-dt);}hudT-=dt;if(hudT<=0){hud();hudT=.1;}}
 else if(JD.state!=='pause'){moving=WD.step(dt);}return moving;};
JD.frozen=false;
function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;
 let moving=JD.frozen?0:JD.tick(dt);const play=JD.state==='play';
 if(play||moving||JD.dirty||RD.busy()){RD.render(now/1000,dt);JD.dirty=0;}
 requestAnimationFrame(frame);}
// ---------- boot ----------
function wire(){document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{AU.ui();JD.go(b.dataset.go);}));
 $('bPlay').onclick=()=>{AU.unlock();AU.ui();if(!JD.save.tut)JD.start('tutorial');else JD.go('modes');};
 $('bTitleMenu').onclick=()=>{AU.unlock();AU.ui();JD.go('menu');};
 $('bDaily2').onclick=()=>{AU.ui();JD.start('daily');};
 $('bHow').onclick=()=>{AU.ui();JD.start('tutorial');};
 $('bInStart').onclick=()=>{AU.ui();JD.start('cleanout',{i:JD.introI});};
 $('bPause').onclick=()=>{AU.ui();JD.pause();};
 $('bResume').onclick=()=>{AU.ui();JD.resume();};
 $('bRestart').onclick=()=>{AU.ui();const M=JD.M;if(!M)return;M.ended=true;JD.start(M.kind,M.opt);};
 $('bPauseSet').onclick=()=>{AU.ui();JD.setReturn='pause';JD.go('settings');};
 $('bQuit').onclick=()=>{AU.ui();if(JD.M)JD.M.ended=true;UI.tut(null);JD.go('menu');};
 $('bSetBack').onclick=()=>{AU.ui();const r=JD.setReturn||'menu';JD.setReturn=null;JD.go(r);};
 $('bTut').onclick=()=>{AU.ui();JD.setReturn=null;JD.start('tutorial');};
 $('bReset').onclick=()=>{AU.ui();UI.confirm('Reset everything?','Scores, stars, achievements and unlocks will all be gone. Settings stay.',()=>{const set=JD.save.set;JD.save=PG.fresh();JD.save.set=set;JD.persist();RD.static=null;JD.go('menu');UI.toast('Progress reset.');});};
 $('bRotL').onclick=()=>JD.rotateSel(-1);$('bRotR').onclick=()=>JD.rotateSel(1);
 $('bTray').onclick=()=>JD.trayButton();$('bGive').onclick=()=>{if(JD.sel)JD.submit(JD.sel);};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){JD.pause();AU.suspend();}else{AU.resume();}});
 window.addEventListener('resize',()=>{layout();if(JD.state==='play')fitNote();});
 window.addEventListener('orientationchange',()=>setTimeout(layout,200));
 document.addEventListener('gesturestart',e=>e.preventDefault());
 document.addEventListener('dblclick',e=>e.preventDefault());
 document.addEventListener('touchmove',e=>{if(!e.target.closest||!e.target.closest('.scroll,#modeList,#chalGrid,#resLines'))e.preventDefault();},{passive:false});
 document.addEventListener('pointerdown',()=>AU.unlock(),{once:true});
 window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(JD.state==='play')JD.pause();else if(JD.state==='pause')JD.resume();}});}
function boot(){RD.init($('cv'));IN.init($('cv'));JD.applySettings();
 JD.silent=1;LV.build({R:RNG.make(2024),avail:OBJ.base,count:38,magnets:[{m:'horseshoe_magnet',near:['screw','paperclip']}],tangles:[['cable','spoon',3]]});JD.silent=0;
 wire();JD.go('title');requestAnimationFrame(frame);
 if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});}
boot();
})();
