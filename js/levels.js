// Requests, the layout generator, procedural request picking for the endless modes, and the 20 Big Cleanout challenges.
(function(){
const O=OBJ.DEFS;
const WHO=['Mom','Dad','Gran','Sam','Uncle Dev','The neighbor','Your sister'];
// mystery requests: describe a use, anything carrying the tag counts
const MYST={
 tighten:["Find something that can tighten this.","This screw's loose. Anything that'll turn it?","The cabinet door is wobbly. Find something to fix it with."],
 pry:["Find something that can open a paint can.","I need to pry this lid off. Something flat and strong.","The paint can's stuck. Anything to lever it open?"],
 write:["Something to write with. Quick, before I forget the number.","Find me something that writes."],
 writeon:["Something I can write on. Anything.","I need to leave a note for the plumber. Something to write it on."],
 light:["It's dark under the sink. Anything that makes light?","The power's out. Find something that glows."],
 clip:["I need to keep this bag of chips closed.","Find something that holds things together."],
 unlock:["Find something that opens a lock. Any lock.","Something that opens a door. I don't care which door."],
 money:["The pizza guy is here and I'm short. Find some change.","Any coins in there? I'm one short for the bus."],
 toy:["The kid next door is bored. Find him something to play with.","Something fun. The baby's cranky."],
 sharp:["Something pointy to press the reset button on the router.","I need something thin and pointy. The router's acting up again."],
 bounce:["Find something that bounces.","The dog wants to play. Anything bouncy?"],
 power:["Something with a bit of charge left in it.","The remote's dead. Anything with power in it?"],
 magnet:["Find something that sticks to the fridge by itself."],
 sew:["My hem is coming down. Anything from the sewing kit.","Find me something for sewing. Anything at all."],
 game:["Game night. Find us something to play with.","We need something for the board game. It's missing pieces."],
 measure:["How long is this couch? Something to measure with."],
 fire:["Something to light the candles with."],
 sticky:["The poster keeps falling. Something sticky or pointy."]};
const DECOYS={
 battery_aa:{d:['battery_dead','battery_dead'],t:["I need a battery that actually works.","A good battery. Not one of the crusty ones.","The remote needs a battery. A working one, please."],w:{battery_dead:"That one's dead. Look at the end of it."}},
 battery_9v:{d:['battery_aa','battery_dead'],t:["The smoke alarm is chirping. I need the square battery.","Find the 9-volt. The square one."],w:{battery_aa:"The square one.",battery_dead:"Square. And alive."}},
 screwdriver_tiny:{d:['screwdriver_small','screwdriver_big'],t:["The small screwdriver. No, the smaller one.","The tiny screwdriver. For glasses."],w:{screwdriver_small:"Smaller.",screwdriver_big:"Much, much smaller."}},
 screwdriver_big:{d:['screwdriver_small','screwdriver_tiny'],t:["The big screwdriver. For the paint can.","The biggest screwdriver we have."],w:{screwdriver_small:"Bigger.",screwdriver_tiny:"That's for glasses. Bigger."}},
 shed_key:{d:['house_key','car_key'],t:["Have you seen the key to the shed?","The shed key. The rusty one with the square top."],w:{house_key:"That's the house key. The shed one is rusty.",car_key:"That's for the car we sold."}},
 house_key:{d:['shed_key','car_key'],t:["The spare house key. The brass one with the round top.","Find the house key. Not the shed one."],w:{shed_key:"That's the shed key. We don't have a shed.",car_key:"That's a car key. Wrong door."}},
 quarter:{d:['penny','penny','button'],t:["I need a quarter for the laundry.","Find a quarter. The silver one."],w:{penny:"That's a penny.",button:"That's a button. The machine knows the difference."}}};
const COMBOS={
 flash:{s:[{id:'flashlight'},{id:'battery_aa'}],t:"The flashlight's dead. Get me the flashlight and a battery that works."},
 note:{s:[{tag:'write'},{tag:'writeon'}],t:"Something to write with and something to write on."},
 screw:{s:[{id:'screw'},{tag:'tighten'}],t:"One screw and something to put it in with."},
 remote:{s:[{id:'battery_aa'},{id:'battery_aa'}],t:"The remote takes two batteries. Two good ones."},
 game:{s:[{id:'card'},{id:'dice'}],t:"Game night. The ace of spades and the die."},
 fridge:{s:[{id:'receipt'},{tag:'magnet'}],t:"The receipt and a magnet. It's going on the fridge where we can see it."},
 keys:{s:[{id:'house_key'},{id:'shed_key'},{id:'car_key'}],t:"All the keys. Every one. I'm buying a key hook."},
 taxes:{s:[{id:'pencil'},{id:'eraser'},{id:'receipt'}],t:"Pencil, eraser, and the old receipt. I'm doing taxes. From 2004."},
 glassfix:{s:[{id:'glasses'},{id:'screwdriver_tiny'}],t:"My glasses and the tiny screwdriver. They're loose again."},
 candles:{s:[{id:'candle'},{id:'matchbook'}],t:"Birthday in five minutes. A candle and the matches."},
 laundry:{s:[{id:'quarter'},{id:'quarter'}],t:"Two quarters. The laundry went up again."},
 pin:{s:[{id:'safety_pin'},{id:'button'}],t:"A safety pin and a button. My coat is held together by hope."}};
const WRONG=["That's the {n}. Keep looking.","No, that's the {n}.","Why would I need the {n}?","Close enough? No. Not really.","That's not it.","Hm. That's the {n}."];
const L={WHO,MYST,DECOYS,COMBOS,WRONG};
function matchSlot(s,o){if(s.id)return o.d.id===s.id;if(s.tag)return o.d.tags.includes(s.tag)&&!o.d.tags.includes('dead');return false;}
L.matchSlot=matchSlot;
// does an object satisfy any open slot of request r?  returns slot index or -1
L.match=function(r,o){for(let i=0;i<r.slots.length;i++){if(r.filled[i])continue;if(matchSlot(r.slots[i],o))return i;}return -1;};
L.availDefs=function(colls){return OBJ.LIST.filter(d=>!d.rare&&(d.coll==='base'||colls.includes(d.coll)));};
function who(R){return R.pick(WHO);}
// build a request object from a spec
L.makeReq=function(spec,R,avail){let r;
 if(spec.id){const d=O[spec.id];r={kind:spec.bury?'buried':'named',text:spec.text||R.pick(d.req),slots:[{id:spec.id}],bury:spec.bury||0};}
 else if(spec.decoy){const g=DECOYS[spec.decoy];r={kind:'decoy',text:R.pick(g.t),slots:[{id:spec.decoy}],decoys:g.d,wrong:g.w,bury:spec.bury||0};}
 else if(spec.tag){r={kind:'mystery',text:R.pick(MYST[spec.tag]),slots:[{tag:spec.tag}],bury:spec.bury||0};}
 else if(spec.combo){const c=COMBOS[spec.combo];r={kind:'combo',text:c.t,slots:c.s.map(s=>Object.assign({},s)),bury:spec.bury||0,combo:spec.combo};}
 r.who=spec.who||who(R);r.filled=r.slots.map(()=>null);r.mistakes=0;r.spec=spec;return r;};
// defs that must exist in the drawer for request r (one per slot, plus decoys)
L.needs=function(r,R,avail){const out=[];for(const s of r.slots){if(s.id)out.push(O[s.id]);else{const c=avail.filter(d=>d.tags.includes(s.tag)&&!d.tags.includes('dead'));out.push(R.pick(c));}}
 return out;};
// ---------- placement helpers ----------
function inside(o){for(let k=0;k<6;k++){const b=WD.bounds(o);let dx=0,dy=0;if(b[0]<2)dx=2-b[0];if(b[2]>WD.W-2)dx=WD.W-2-b[2];if(b[1]<2)dy=2-b[1];if(b[3]>WD.H-2)dy=WD.H-2-b[3];if(!dx&&!dy)break;o.x+=dx;o.y+=dy;}}
L.inside=inside;
function randPos(R,d){const m=Math.min(d.w,d.h)/2+4;return[m+R()*(WD.W-2*m),m+R()*(WD.H-2*m)];}
const VIS_FOR_BURY=[1,.8,.55,.35,.15,.06,.03];
// cover object t with items from pool (existing objects) or new ones
function bury(t,k,R,clutter,avail){const want=VIS_FOR_BURY[Math.min(k,6)];let used=0,guard=0;
 const big=clutter.filter(o=>o!==t&&o.d.w*o.d.h>=t.d.w*t.d.h*.5&&!o.tang&&!o.mag&&!o.d.magnet&&!o.d.fragile);
 R.shuffle(big);
 while(guard++<12&&(used<k||WD.vis(t)>want)){let o=big.pop();
  if(!o){if(L.cap&&WD.live().length>=L.cap)break;const pool=avail.filter(d=>!d.fragile&&!d.magnet&&!d.tangler&&!(L.excl&&L.excl.has(d.id))&&d.id!==t.d.id&&d.w*d.h>=t.d.w*t.d.h*.6);o=WD.add(R.pick(pool.length?pool:avail),0,0,0);}
  o.x=t.x+(R()-.5)*t.d.w*.5;o.y=t.y+(R()-.5)*t.d.h*.5;o.r=R()*Math.PI*2;if(o.z<t.z){o.z=++WD.zc;WD.sort();}inside(o);used++;}
 return WD.vis(t);}
L.bury=bury;
// point where most stuff is piled
function densest(R){let best=null,bn=-1;for(let i=0;i<40;i++){const x=30+R()*(WD.W-60),y=30+R()*(WD.H-60);let n=0;for(const o of WD.objs){if(o.gone||o.tray>=0)continue;if(WD.hitObj(o,x,y,false))n++;}if(n>bn){bn=n;best=[x,y];}}return best;}
// hide a new instance of def under the pile (used when a request needs something the drawer lacks)
L.hideUnder=function(def,R,depth){const p=densest(R);const o=WD.add(def,p[0],p[1],R()*Math.PI*2);WD.lower(o);inside(o);
 if(depth&&WD.vis(o)>VIS_FOR_BURY[Math.min(depth,6)]){bury(o,depth,R,WD.live().filter(q=>q!==o),L.lastAvail||OBJ.base);}return o;};
// toss something into the drawer from above (lands on top)
L.toss=function(def,R,x,y){const p=x!==undefined?[x,y]:randPos(R,def);const o=WD.add(def,p[0],p[1],R()*Math.PI*2,{drop:1,tl:0});inside(o);return o;};
const DUPES=['screw','screw','battery_dead','penny','paperclip','button','rubber_band'];
function clutterDef(R,avail){if(R()<.18){const id=R.pick(DUPES);if(avail.find(d=>d.id===id))return O[id];}return R.pick(avail);}
L.clutterDef=clutterDef;
/* build a fresh drawer.
 opt: {R, avail, count, reqs:[request], fragile:[ids], include:[ids], magnets:[{m,near}], tangles:[[cableId,targetId]], rare:prob} */
L.build=function(opt){const R=opt.R,avail=opt.avail;L.lastAvail=avail;L.excl=null;WD.reset();
 const targets=[];
 // 1. request targets, lowest first
 for(const r of opt.reqs||[]){const ds=L.needs(r,R,avail);r.targets=[];
  ds.forEach(d=>{const p=randPos(R,d);const o=WD.add(d,p[0],p[1],R()*Math.PI*2);o.need=r;targets.push([o,r.bury||0]);r.targets.push(o);});
  if(r.decoys)r.decoys.forEach(id=>{const d=O[id];const p=randPos(R,d);WD.add(d,p[0],p[1],R()*Math.PI*2,{decoy:1});});}
 if(opt.rare&&R()<opt.rare){const d=R.pick(OBJ.rares);const p=randPos(R,d);const o=WD.add(d,p[0],p[1],R()*Math.PI*2);targets.push([o,2]);}
 (opt.include||[]).forEach(id=>{const d=O[id];const p=randPos(R,d);WD.add(d,p[0],p[1],R()*Math.PI*2);});
 (opt.fragile||[]).forEach(id=>{if(WD.objs.find(o=>o.d.id===id))return;const d=O[id];const p=randPos(R,d);WD.add(d,p[0],p[1],R()*Math.PI*2);});
 // 2. clutter (never a second copy of something requested, so buried targets stay buried)
 const excl=new Set();for(const r of opt.reqs||[])for(const sl of r.slots){if(sl.id)excl.add(sl.id);else avail.forEach(d=>{if(d.tags.includes(sl.tag))excl.add(d.id);});}
 L.excl=excl;const cpool=avail.filter(d=>!d.tangler&&!d.magnet&&!excl.has(d.id));
 const n=Math.max(0,(opt.count||16)-WD.objs.length);const clutter=[];
 for(let i=0;i<n;i++){const d=clutterDef(R,cpool);const p=randPos(R,d);clutter.push(WD.add(d,p[0],p[1],R()*Math.PI*2));}
 for(const o of WD.objs)inside(o);
 // 3. magnets: gather nearby metal things onto them
 for(const mg of opt.magnets||[]){let m=WD.objs.find(o=>o.d.id===mg.m&&!o.mag);if(!m){const p=randPos(R,O[mg.m]);m=WD.add(O[mg.m],p[0],p[1],R()*Math.PI*2);inside(m);}
  m.x=Math.max(60,Math.min(WD.W-60,m.x));m.y=Math.max(60,Math.min(WD.H-60,m.y));
  for(const id of mg.near||[]){let o=WD.objs.find(q=>q.d.id===id&&!q.mag&&q!==m&&!q.tang);if(!o)o=WD.add(O[id],0,0,0);const a=R()*Math.PI*2;o.x=m.x+Math.cos(a)*30;o.y=m.y+Math.sin(a)*30;o.r=R()*Math.PI*2;WD.attach(m,o);o.snap=1;}
  WD.raise(m);}
 // 4. bury targets (deepest requirement first)
 targets.sort((a,b)=>b[1]-a[1]);
 for(const [t,k] of targets){if(t.mag)continue;if(k>0)bury(t,k,R,clutter,avail);else if(WD.vis(t)<.6){WD.raise(t);}}
 // 5. tangles: a cable wrapped around something
 for(const tg of opt.tangles||[]){const b=WD.objs.find(o=>o.d.id===tg[1]&&!o.tang&&!o.mag);if(!b)continue;const a=WD.add(O[tg[0]],b.x+(R()-.5)*14,b.y+(R()-.5)*14,R()*Math.PI*2);inside(a);inside(b);WD.raise(b);WD.tangle(a,b,tg[2]||3);WD.raise(a);}
 for(const o of WD.objs){if(!o.mag&&!(o.tang&&o.tang.b===o))inside(o);}
 // final settle of magnet followers
 WD.step(0);
 return WD.objs;};

// ---------- procedural requests for the endless modes (persistent drawer) ----------
L.kindWeights=function(d){return{named:5,buried:d>=1?3:0,decoy:d>=2?2:0,tangle:d>=2?1.4:0,magnet:d>=2?1.4:0,mystery:d>=3?2.4:0,combo:d>=4?1.8:0};};
function wpick(R,w){let s=0;for(const k in w)s+=w[k];let x=R()*s;for(const k in w){x-=w[k];if(x<=0)return k;}return 'named';}
function liveOf(id){return WD.objs.filter(o=>!o.gone&&o.d.id===id);}
function requestable(o){return !o.gone&&!o.d.rare&&o.d.req.length&&!o.d.tangler;}
L.ensure=function(def,R,depth){const have=liveOf(def.id);if(have.length)return have[0];return L.hideUnder(def,R,depth||1);};
L.pickReq=function(d,R,avail,recent){recent=recent||[];const w=L.kindWeights(d);const ok=id=>avail.find(a=>a.id===id);
 for(let tries=0;tries<12;tries++){const k=wpick(R,w);let r=null;
  if(k==='named'||k==='buried'){const best={};for(const o of WD.objs){if(o.gone)continue;const v=o.tray>=0?1:WD.vis(o);best[o.d.id]=Math.max(best[o.d.id]||0,v);}
   const cands=WD.live().filter(o=>requestable(o)&&!recent.includes(o.d.id)&&!o.mag&&!o.tang).map(o=>[o,best[o.d.id]]);
   const pool=k==='named'?cands.filter(c=>c[1]>=(d<1?.55:.3)):cands.filter(c=>c[1]<.5);
   if(pool.length){const o=R.pick(pool)[0];r=L.makeReq({id:o.d.id},R,avail);r.kind=k;}
   else if(k==='buried'){const def=R.pick(avail.filter(a=>a.req.length&&!a.tangler&&!recent.includes(a.id)));L.hideUnder(def,R,2+Math.min(2,d>>2));r=L.makeReq({id:def.id,bury:2},R,avail);}}
  else if(k==='decoy'){const keys=Object.keys(DECOYS).filter(id=>ok(id)&&!recent.includes(id));if(!keys.length)continue;const id=R.pick(keys);r=L.makeReq({decoy:id},R,avail);
   L.ensure(O[id],R,1+Math.min(2,d>>2));const need={};DECOYS[id].d.forEach(x=>need[x]=(need[x]||0)+1);for(const x in need){let n=need[x]-liveOf(x).length;while(n-->0)L.toss(O[x],R);}}
  else if(k==='tangle'){let t=WD.tangles.find(t=>requestable(t.b)&&!recent.includes(t.b.d.id));
   if(!t){const c=WD.live().filter(o=>requestable(o)&&!o.mag&&!o.tang&&!o.d.magnet&&o.d.w*o.d.h<3600&&!recent.includes(o.d.id));if(!c.length)continue;const b=R.pick(c);
    const a=WD.add(O.cable,b.x+(R()-.5)*12,b.y+(R()-.5)*12,R()*Math.PI*2,{drop:1});inside(a);WD.raise(b);WD.tangle(a,b,2+Math.min(2,d>>2));WD.raise(a);t=b.tang;}
   r=L.makeReq({id:t.b.d.id},R,avail);r.kind='tangle';}
  else if(k==='magnet'){let m=WD.live().find(o=>o.d.magnet);if(!m){m=L.toss(O.horseshoe_magnet,R);m.drop=0;}
   let stuck=WD.objs.filter(o=>o.mag===m&&requestable(o)&&!recent.includes(o.d.id));
   if(!stuck.length){const c=avail.filter(a=>a.metal&&!a.magnet&&a.req.length&&!recent.includes(a.id)&&a.w*a.h<3000);if(!c.length)continue;const def=R.pick(c);const o=WD.add(def,m.x+20,m.y+20,R()*6.28);WD.attach(m,o);stuck=[o];}
   r=L.makeReq({id:R.pick(stuck).d.id},R,avail);r.kind='magnet';}
  else if(k==='mystery'){const tags=Object.keys(MYST).filter(t=>avail.some(a=>a.tags.includes(t)&&!a.tags.includes('dead')));const tag=R.pick(tags);
   if(!WD.live().some(o=>o.d.tags.includes(tag)&&!o.d.tags.includes('dead'))){const c=avail.filter(a=>a.tags.includes(tag)&&!a.tags.includes('dead'));L.hideUnder(R.pick(c),R,1);}
   r=L.makeReq({tag},R,avail);}
  else if(k==='combo'){const keys=Object.keys(COMBOS).filter(c=>COMBOS[c].s.every(s=>s.tag?avail.some(a=>a.tags.includes(s.tag)):ok(s.id)));const c=R.pick(keys);r=L.makeReq({combo:c},R,avail);
   const cnt={};for(const s of r.slots){if(s.id){cnt[s.id]=(cnt[s.id]||0)+1;}else if(!WD.live().some(o=>o.d.tags.includes(s.tag)&&!o.d.tags.includes('dead'))){L.hideUnder(R.pick(avail.filter(a=>a.tags.includes(s.tag)&&!a.tags.includes('dead'))),R,1);}}
   for(const id in cnt){let n=cnt[id]-liveOf(id).length;while(n-->0)L.hideUnder(O[id],R,1);}}
  if(r)return r;}
 const o=R.pick(WD.live().filter(requestable));return L.makeReq({id:o.d.id},R,avail);};

// ---------- THE BIG CLEANOUT: 20 handcrafted challenges ----------
L.CHALLENGES=[
 {n:'First Look',i:"Somebody needs a few things. They're all in plain sight. Mostly.",count:14,time:150,par:45,reqs:[{id:'house_key'},{id:'tape'},{id:'toy_car'}]},
 {n:'Underneath',i:"Things sink. Drag the stuff on top out of the way.",count:19,time:150,par:55,reqs:[{id:'battery_aa',bury:2},{id:'comb',bury:1},{id:'button',bury:2}]},
 {n:'The Tray',i:"Running out of room? Drag clutter into the tray at the bottom.",count:24,time:180,par:65,reqs:[{id:'pencil',bury:3},{id:'receipt',bury:2},{id:'screw',bury:3}]},
 {n:'Handle With Care',i:"Glass cracks if something heavy lands on it. Put heavy things down gently, somewhere else.",count:22,time:180,par:65,fragile:['lightbulb','watch','glasses'],include:['padlock','brass_fitting'],reqs:[{id:'glasses',bury:1},{id:'padlock'},{id:'lightbulb',bury:1}]},
 {n:'The Good Battery',i:"Most of these batteries are dead. Check the ends.",count:22,time:180,par:60,reqs:[{decoy:'battery_aa'},{decoy:'battery_9v'},{id:'flashlight',bury:1}]},
 {n:'The Smaller One',i:"Three screwdrivers, two coins, one person who knows exactly what they want.",count:24,time:180,par:65,reqs:[{decoy:'screwdriver_tiny'},{decoy:'screwdriver_big'},{decoy:'quarter'}]},
 {n:'Stuck',i:"The magnet grabs anything metal. Pull hard to get things off it.",count:22,time:180,par:60,magnets:[{m:'horseshoe_magnet',near:['house_key','screw','paperclip','spoon']}],reqs:[{id:'house_key'},{id:'paperclip'},{id:'eraser',bury:2}]},
 {n:'Pull Harder',i:"Two magnets. Every key in the house seems to be stuck to one of them.",count:27,time:210,par:80,magnets:[{m:'horseshoe_magnet',near:['shed_key','house_key','car_key']},{m:'fridge_magnet',near:['quarter','screw']}],reqs:[{decoy:'shed_key'},{id:'quarter'},{id:'bottle_opener',bury:2}]},
 {n:'Knots',i:"The cable has wrapped itself around something. Tap the knot to work it loose.",count:22,time:180,par:65,tangles:[['cable','car_key',3]],reqs:[{id:'car_key'},{id:'clothespin',bury:2},{id:'card',bury:1}]},
 {n:'Cable Management',i:"Two cables this time. Shake a tangled thing while you drag it, or tap the knot.",count:27,time:210,par:80,tangles:[['cable','spoon',3],['cable','measuring_tape',3]],reqs:[{id:'measuring_tape'},{id:'spoon'},{id:'cassette',bury:2}]},
 {n:'Use Your Head',i:"Some people describe what they need. Anything that fits the job will do.",count:27,time:210,par:75,reqs:[{tag:'tighten'},{tag:'writeon'},{tag:'clip'},{tag:'light'}]},
 {n:'Something To...',i:"Descriptions and lookalikes. Read the note twice.",count:30,time:210,par:80,reqs:[{tag:'pry',bury:1},{decoy:'house_key'},{tag:'money'},{tag:'bounce',bury:2}]},
 {n:'Two Things',i:"Some requests need more than one thing. Hand them over one at a time.",count:27,time:210,par:80,reqs:[{combo:'flash'},{combo:'note'},{id:'dice',bury:2}]},
 {n:'The Whole Set',i:"Three things at once. Somebody is getting organized.",count:32,time:240,par:95,reqs:[{combo:'keys'},{combo:'taxes'}]},
 {n:'Uh Oh',i:"Drawers have a mind of their own. Things roll when you least want them to.",count:24,time:210,par:75,include:['toy_car','rubber_ball','battery_aa','pencil'],disasters:['roll','slam'],every:14,reqs:[{decoy:'battery_aa'},{id:'toy_car'},{id:'rubber_ball',bury:1},{id:'pencil',bury:2}]},
 {n:'Spring Loaded',i:"There's a spring in here. It's been waiting a long time.",count:32,time:210,par:80,include:['spring','screw','screw','screw','paperclip','rubber_band'],disasters:['spring','snap'],every:12,reqs:[{id:'screw',bury:1},{id:'paperclip',bury:2},{id:'spring'},{id:'button',bury:2}]},
 {n:'Deep Drawer',i:"Nobody has seen the bottom of this drawer since 2011.",count:46,time:270,par:110,reqs:[{id:'shed_key',bury:4},{id:'penny',bury:4},{id:'eraser',bury:3}]},
 {n:"Gran's Mess",i:"Gran keeps everything, and most of it is glass. Gently.",count:38,time:270,par:110,fragile:['lightbulb','watch'],include:['padlock'],tangles:[['cable','glasses',3]],magnets:[{m:'fridge_magnet',near:['screwdriver_small']}],reqs:[{id:'glasses'},{decoy:'screwdriver_tiny'},{id:'watch',bury:2},{tag:'sew'}]},
 {n:'Everything Everywhere',i:"Magnets, knots, lookalikes and a spring. All at once.",count:43,time:300,par:130,include:['spring','screw','screw'],magnets:[{m:'horseshoe_magnet',near:['bottle_opener','screw']}],tangles:[['cable','flashlight',3]],disasters:['spring','roll','slam'],every:16,reqs:[{id:'bottle_opener'},{combo:'flash'},{decoy:'battery_9v'},{tag:'game',bury:2},{id:'cassette',bury:3}]},
 {n:'The Receipt From 2004',i:"It's in here. It has always been in here.",count:54,time:330,par:140,fragile:['lightbulb'],magnets:[{m:'horseshoe_magnet',near:['spoon','paperclip']}],tangles:[['cable','tape',3]],disasters:['slam','roll'],every:18,reqs:[{id:'brass_fitting',bury:2},{decoy:'shed_key'},{tag:'write'},{id:'receipt',bury:6}]}];
window.LV=L;
})();
