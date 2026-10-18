// Object catalog: every drawer object type, its physical properties, tags, flavour text and illustration.
// Each draw(g) paints the object centred on (0,0) with its long axis along x, inside w x h.
(function(){
const DEFS={},LIST=[];
const P=Math.PI;
function D(id,o){o.id=id;o.coll=o.coll||'base';o.tags=o.tags||[];o.desc=o.desc||[];o.req=o.req||[];o.wt=o.wt||1;DEFS[id]=o;LIST.push(o);}

// ---------- KEYS ----------
D('house_key',{n:'spare house key',w:64,h:28,mat:'metal',metal:1,tags:['key','unlock','metal'],
 desc:['The spare. It used to live under the mat.','Brass, a bit worn. Fits the front door if you jiggle it.'],
 req:['Find the spare house key.','I locked myself out again. Where’s the spare key?','The house key. The brass one with the round top.'],
 draw(g){const B=A.brass(g,-13,13);
  g.beginPath();g.moveTo(-8,-4.5);g.lineTo(28,-4.5);g.lineTo(31,-1.5);g.lineTo(31,2);g.lineTo(28,2);g.lineTo(26,7);g.lineTo(23,3);g.lineTo(20,7.5);g.lineTo(17,3);g.lineTo(14,6.5);g.lineTo(11,3);g.lineTo(-8,3);g.closePath();A.fs(g,B);
  g.beginPath();g.moveTo(-4,-1);g.lineTo(27,-1);A.st(g,'rgba(110,70,15,.55)',1.1);
  g.beginPath();g.arc(-18,0,12.5,0,P*2);g.moveTo(-20.5,0);g.arc(-24,0,3.5,0,P*2);A.fs(g,B,1.5,'evenodd');
  g.beginPath();g.arc(-18,0,8.5,0,P*2);A.st(g,'rgba(120,80,20,.35)',1);
  A.hlc(g,-18,0,10.5,P*1.1,P*1.6,.75,1.6);A.hl(g,-4,-3,24,-3,.7,1.1);}});
D('shed_key',{n:'shed key',w:64,h:30,mat:'metal',metal:1,tags:['key','unlock','metal'],
 desc:['Opens the shed. You don’t have a shed.','Rusty. Square top. Nobody remembers which shed.'],
 req:['Have you seen the key to the shed?','The shed key. The rusty one, with the square top.','I want to check the shed. Find me the key.'],
 draw(g){const B=A.iron(g,-14,14);
  g.beginPath();g.moveTo(-6,-4);g.lineTo(30,-4);g.lineTo(30,4);g.lineTo(24,4);g.lineTo(24,9);g.lineTo(18,9);g.lineTo(18,4);g.lineTo(-6,4);g.closePath();A.fs(g,B);
  A.rr(g,-31,-13,26,26,5);g.moveTo(-15,0);g.arc(-19,0,4,0,P*2);A.fs(g,B,1.5,'evenodd');
  g.fillStyle='rgba(176,92,34,.55)';[[-26,-8,3],[-10,8,2.5],[6,-1,2],[20,2,2.2],[-24,7,2]].forEach(a=>{A.circ(g,a[0],a[1],a[2]);g.fill();});
  A.hl(g,-27,-10,-10,-10,.4,1.2);A.hl(g,-2,-2.5,27,-2.5,.35,1);}});
D('car_key',{n:'car key',w:74,h:30,mat:'plastic',metal:1,tags:['key','unlock','metal'],
 desc:['For a car we sold in 2016. The new owners have their own.','The button still clicks. Somewhere a car is very confused.'],
 req:['Where’s the car key? The one with the black top.','I need the car key. Not that car. The old one.','Find the car key. The fat black one.'],
 draw(g){const S=A.steel(g,-6,6);
  g.beginPath();g.moveTo(2,-5);g.lineTo(33,-5);g.lineTo(36,0);g.lineTo(33,5);g.lineTo(2,5);g.closePath();A.fs(g,S);
  g.beginPath();g.moveTo(6,0);g.lineTo(31,0);A.st(g,'rgba(40,40,50,.5)',1.2);
  A.rr(g,-36,-14,40,28,12);A.fs(g,A.plastic(g,-14,14,'#3a3d44','#15161a'));
  A.rr(g,-28,-8,18,16,6);A.fs(g,A.plastic(g,-8,8,'#5a5e68','#2b2d33'),1.2);
  A.circ(g,-19,0,3);A.f(g,'#c94b3b');A.hl(g,-32,-9,-12,-11,.35,1.6);}});

// ---------- POWER ----------
function aa(g,dead){
 const body=dead?A.plastic(g,-9,9,'#6d6457','#3a342c'):A.plastic(g,-9,9,'#2d2a2a','#0d0c0c');
 A.rr(g,-27,-9,48,18,4);A.fs(g,body);
 A.rr(g,8,-9,14,18,2);A.fs(g,dead?A.lin(g,0,-9,0,9,['#b59a80','#8a6f57','#6a5643']):A.copper(g,-9,9),1.2);
 A.rr(g,21,-4,6,8,2);A.fs(g,A.steel(g,-4,4),1.2);
 g.beginPath();g.moveTo(-14,-4);g.lineTo(-8,-1);g.lineTo(-11,1);g.lineTo(-4,5);A.st(g,dead?'#9a8f7d':'#ffe14d',1.6);
 if(dead){g.fillStyle='#f3efe2';[[23,-6,2.6],[26,5,2.2],[21,6,1.8],[25,-1,1.6],[19,-7,1.5]].forEach(a=>{A.circ(g,a[0],a[1],a[2]);g.fill();});
  g.beginPath();g.moveTo(-6,-9);g.quadraticCurveTo(-3,-5,0,-9);A.st(g,'rgba(0,0,0,.45)',1.2);}
 else A.hl(g,-24,-5,6,-5,.45,1.6);}
D('battery_aa',{n:'battery',w:56,h:18,mat:'metal',metal:1,roll:1,tags:['battery','power','metal'],
 desc:['Copper top, full charge. Probably.','A good one. Treat it with respect.'],
 req:['Where’s that battery?','I need a battery that actually works.','Find a good battery. The remote’s dying.'],
 draw(g){aa(g,0);}});
D('battery_dead',{n:'dead battery',w:56,h:18,mat:'metal',metal:1,roll:1,tags:['battery','metal','dead'],
 desc:['Dead. You can tell by the crust.','Kept for reasons nobody can explain.'],
 req:['Find a dead battery. I’m finally recycling them.'],
 draw(g){aa(g,1);}});
D('battery_9v',{n:'9-volt battery',w:40,h:28,mat:'metal',metal:1,tags:['battery','power','metal'],
 desc:['Lick test not recommended.','The smoke alarm has been chirping for a month.'],
 req:['The smoke alarm is chirping. Find the square battery.','Get me the 9-volt.'],
 draw(g){A.rr(g,-18,-13,32,26,3);A.fs(g,A.plastic(g,-13,13,'#3c68b8','#1c3366'));
  A.rr(g,-18,-13,12,26,2);A.fs(g,A.steel(g,-13,13),1.2);
  A.circ(g,16,-6,4.2);A.fs(g,A.steel(g,-10,-2),1.2);
  g.beginPath();for(let i=0;i<6;i++){const a=i*P/3;g.lineTo(16+4.6*Math.cos(a),6+4.6*Math.sin(a));}g.closePath();A.fs(g,A.steel(g,2,10),1.2);
  g.beginPath();g.moveTo(-1,-6);g.lineTo(7,-6);A.st(g,'#ffd34d',2);g.beginPath();g.moveTo(-1,0);g.lineTo(10,0);A.st(g,'rgba(255,255,255,.5)',1.2);A.hl(g,-4,-10,11,-10,.45,1.3);}});

// ---------- SCREWDRIVERS ----------
function sd(g,L,hl,hw,col,shL,shW,tip){
 const x0=-L/2,hx=x0+hl;
 A.rr(g,x0,-hw/2,hl,hw,hw*.45);A.fs(g,A.plastic(g,-hw/2,hw/2,col));
 for(let i=1;i<5;i++){g.beginPath();g.moveTo(x0+i*hl/5.5+hl*.06,-hw*.35);g.lineTo(x0+i*hl/5.5+hl*.06,hw*.35);A.st(g,'rgba(0,0,0,.25)',1.2);}
 A.hl(g,x0+4,-hw*.28,hx-5,-hw*.28,.5,1.4);
 A.rr(g,hx-1,-shW*.85,5,shW*1.7,1.5);A.fs(g,A.steel(g,-shW,shW),1.1);
 g.beginPath();g.moveTo(hx+4,-shW/2);g.lineTo(hx+4+shL,-shW/2);
 if(tip==='flat'){g.lineTo(hx+4+shL+4,-shW*.8);g.lineTo(hx+4+shL+6,-shW*.8);g.lineTo(hx+4+shL+6,shW*.8);g.lineTo(hx+4+shL+4,shW*.8);}
 else{g.lineTo(hx+4+shL+5,0);}
 g.lineTo(hx+4+shL,shW/2);g.lineTo(hx+4,shW/2);g.closePath();A.fs(g,A.steel(g,-shW,shW),1.1);
 A.hl(g,hx+6,-shW*.2,hx+shL,-shW*.2,.6,.9);}
D('screwdriver_big',{n:'big screwdriver',w:122,h:24,mat:'plastic',wt:2,metal:1,tags:['screwdriver','tighten','pry','metal'],
 desc:['The big flathead. Mostly used to open paint cans.','Has opened more paint cans than screws.'],
 req:['Get me the big screwdriver.','The big flathead. The red one.','Find the big screwdriver. The paint can won’t open itself.'],
 draw(g){sd(g,116,46,22,'#c8392e',60,6,'flat');}});
D('screwdriver_small',{n:'small screwdriver',w:94,h:18,mat:'plastic',metal:1,tags:['screwdriver','tighten','metal'],
 desc:['Phillips head. The yellow one. Medium, really.','Someone wrote MINE on it in marker, then crossed it out.'],
 req:['Get me the little screwdriver.','The yellow screwdriver, please.','Phillips screwdriver. The yellow one.'],
 draw(g){sd(g,90,38,16,'#e9b62c',44,4.4,'cross');}});
D('screwdriver_tiny',{n:'tiny screwdriver',w:66,h:11,mat:'metal',metal:1,tags:['screwdriver','tighten','metal','small'],
 desc:['For glasses. And for losing.','The smallest screwdriver in the world, or at least in this house.'],
 req:['The small screwdriver. No, the smaller one.','My glasses are loose. Find the tiny screwdriver.','The tiny blue one. For glasses.'],
 draw(g){A.rr(g,-32,-5,30,10,3);A.fs(g,A.plastic(g,-5,5,'#4a7fd0','#21447d'),1.2);
  for(let i=0;i<6;i++){g.beginPath();g.moveTo(-27+i*4,-4);g.lineTo(-27+i*4,4);A.st(g,'rgba(0,0,30,.35)',.9);}
  A.rr(g,-34,-4,4,8,1.5);A.fs(g,A.steel(g,-4,4),1);
  g.beginPath();g.moveTo(-2,-1.8);g.lineTo(28,-1.8);g.lineTo(31,-1);g.lineTo(31,1);g.lineTo(28,1.8);g.lineTo(-2,1.8);g.closePath();A.fs(g,A.steel(g,-2,2),1);}});

// ---------- KITCHEN-ISH BASE ----------
D('spoon',{n:'bent spoon',w:106,h:32,mat:'metal',metal:1,tags:['spoon','pry','metal'],
 desc:['Bent prying open something. Nobody admits what.','It still works as a spoon, if you hold it sideways.'],
 req:['Where’s the bent spoon? I want it back.','Find the spoon. The bent one.'],
 draw(g){const S=A.steel(g,-14,14);
  g.beginPath();g.moveTo(-50,4);g.quadraticCurveTo(-48,-2,-38,-1);g.lineTo(-6,-3);g.quadraticCurveTo(6,-5,18,-4);g.lineTo(18,3);g.quadraticCurveTo(6,2,-6,4);g.lineTo(-38,6);g.quadraticCurveTo(-49,8,-50,4);g.closePath();A.fs(g,S);
  A.ell(g,34,0,17,12.5,-.06);A.fs(g,A.rad(g,30,-4,1,18,['#ffffff','#cfd5db','#8f98a1','#5d656d']));
  A.ell(g,34,0,12,8.5,-.06);A.st(g,'rgba(60,66,72,.35)',1.2);A.hlc(g,32,-1,8,P*1.1,P*1.55,.85,1.8);
  A.hl(g,-44,2,-8,0,.6,1.2);}});
D('tape',{n:'roll of tape',w:48,h:48,mat:'plastic',tags:['tape','sticky','fix'],
 desc:['You’ll never find the end. You’ll lose a fingernail trying.','Clear tape, a bit dusty on the edges.'],
 req:['Find the tape.','Where’s the tape? The poster’s falling down.','I need tape. The clear stuff.'],
 draw(g){g.beginPath();g.arc(0,0,22,0,P*2);g.moveTo(10.5,0);g.arc(0,0,10.5,0,P*2,true);A.fs(g,A.rad(g,-6,-6,6,24,['rgba(255,236,190,.95)','rgba(232,196,120,.9)','rgba(190,150,80,.95)']),1.5,'evenodd');
  g.beginPath();g.arc(0,0,13.5,0,P*2);g.arc(0,0,10.5,0,P*2,true);A.f(g,'#b68b55','evenodd');g.beginPath();g.arc(0,0,13.5,0,P*2);A.st(g,A.OUT,1);g.beginPath();g.arc(0,0,10.5,0,P*2);A.st(g,A.OUT,1.2);
  for(let r=15.5;r<21;r+=2.2){g.beginPath();g.arc(0,0,r,0,P*2);A.st(g,'rgba(150,110,50,.25)',.7);}
  g.beginPath();g.moveTo(20,-6);g.lineTo(25,-4);g.lineTo(23.5,3);g.lineTo(21.5,6);A.st(g,'rgba(140,100,40,.7)',1.2);
  A.hlc(g,0,0,18,P*1.05,P*1.5,.7,2);}});
D('rubber_ball',{n:'rubber band ball',w:40,h:40,mat:'rubber',roll:1,tags:['bounce','toy','rubber'],
 desc:['Seven years of rubber bands from the newspaper.','Bounces higher than it should.'],
 req:['Find the rubber band ball.','Where did the rubber band ball go?'],
 draw(g){A.circ(g,0,0,19);A.fs(g,A.rad(g,-6,-6,2,20,['#ff9a7a','#d9573c','#8f2f1f']));
  const cols=['#e7c03a','#3f8fd2','#5bb04d','#e86a3a','#b8509e','#f1e3c0'];
  A.circ(g,0,0,18.3);A.inside(g,()=>{for(let i=0;i<16;i++){const a=i*2.39,r=6+(i*7)%13;g.beginPath();g.ellipse(Math.cos(a)*4,Math.sin(a)*4,20,r,a,0,P*2);A.st(g,cols[i%6],2.2);g.beginPath();g.ellipse(Math.cos(a)*4,Math.sin(a)*4,20,r,a,0,P*2);A.st(g,'rgba(0,0,0,.25)',.5);}
   g.fillStyle='rgba(0,0,0,.18)';g.beginPath();g.arc(5,6,18,0,P*2);g.arc(-2,-2,18,0,P*2,true);g.fill('evenodd');});
  A.circ(g,0,0,19);A.st(g,A.OUT,1.5);A.hlc(g,0,0,14,P*1.1,P*1.45,.6,2.4);}});
D('watch',{n:'old watch',w:86,h:36,mat:'glass',fragile:1,metal:1,tags:['watch','time','glass'],
 desc:['Stopped at 4:17. Grandpa swore it was still right twice a day.','Real glass face. Don’t drop things on it.'],
 req:['Have you seen Grandpa\'s watch?','Find the old watch. Gently.','Where’s the watch? The one that stopped.'],
 draw(g){A.rr(g,-43,-8,86,16,6);A.fs(g,A.lin(g,0,-8,0,8,['#a8683a','#7b4422','#5a2f16']));
  for(let i=0;i<4;i++){A.circ(g,22+i*5,0,1.4);A.f(g,'#2b1c12');}
  g.beginPath();g.moveTo(-40,-5);g.lineTo(-24,-5);A.st(g,'rgba(255,220,180,.35)',1);
  A.rr(g,-30,-7,5,14,1);A.fs(g,A.brass(g,-7,7),1);
  A.circ(g,0,0,17);A.fs(g,A.brass(g,-17,17));A.rr(g,15,-3,5,6,1.5);A.fs(g,A.brass(g,-3,3),1);
  A.circ(g,0,0,13);A.fs(g,'#f7f0de',1.2);
  for(let i=0;i<12;i++){const a=i*P/6;g.beginPath();g.moveTo(Math.cos(a)*10.5,Math.sin(a)*10.5);g.lineTo(Math.cos(a)*12,Math.sin(a)*12);A.st(g,'#3a2a1c',i%3?0.8:1.5);}
  g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(-P/2+4.28*P/6)*6.5,Math.sin(-P/2+4.28*P/6)*6.5);A.st(g,'#2b1c12',1.7);
  g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(-P/2+17*P/30)*10,Math.sin(-P/2+17*P/30)*10);A.st(g,'#2b1c12',1.1);
  A.circ(g,0,0,13);A.f(g,A.lin(g,-10,-10,10,10,['rgba(255,255,255,.55)','rgba(255,255,255,0)','rgba(255,255,255,.15)']));
  A.hlc(g,0,0,10,P*1.1,P*1.45,.9,1.6);}});
D('bottle_opener',{n:'bottle opener',w:72,h:26,mat:'metal',metal:1,tags:['opener','bottle','pry','metal'],
 desc:['Souvenir from a lake nobody remembers visiting.','It says LAKE on it. Just LAKE.'],
 req:['Find the bottle opener.','I need to open this bottle. Where’s the opener?','Something to open a bottle with. The opener.'],
 draw(g){const S=A.steel(g,-13,13);
  g.beginPath();g.moveTo(-36,-6);g.lineTo(10,-8);g.arc(22,0,13,-2.4,2.4);g.lineTo(-36,6);g.arc(-36,0,6,P/2,P*1.5);g.closePath();
  g.moveTo(-34,0);g.arc(-36,0,2.6,0,P*2);
  g.moveTo(30,-2);g.lineTo(20,-6);g.arc(20,0,6,-P/2,P/2,true);g.lineTo(30,2);g.closePath();A.fs(g,S,1.5,'evenodd');
  A.rr(g,-26,-3.5,26,7,3);A.f(g,'rgba(40,90,140,.6)');A.text(g,'LAKE',-13,0.3,5.5,'rgba(255,255,255,.85)');
  A.hl(g,-32,-4.5,6,-6,.6,1.2);}});
D('padlock',{n:'padlock',w:44,h:58,mat:'metal',wt:3,metal:1,tags:['lock','metal','heavy'],
 desc:['Locked. The combination is somebody\'s birthday. Not yours.','Heavy enough to crack glass. Mind where you put it.'],
 req:['Where’s the padlock?','Find the padlock. The heavy one.','I need a lock for the gym. Find the padlock.'],
 draw(g){g.beginPath();g.moveTo(-14,-2);g.lineTo(-14,-14);g.arc(0,-14,14,P,0);g.lineTo(14,-2);g.lineTo(8,-2);g.lineTo(8,-14);g.arc(0,-14,8,0,P,true);g.lineTo(-8,-2);g.closePath();A.fs(g,A.lin(g,-14,0,14,0,['#a9b1b8','#f1f4f6','#8b939b','#5c636a']));
  A.rr(g,-20,-6,40,34,6);A.fs(g,A.brass(g,-6,28));
  for(let i=0;i<4;i++){g.beginPath();g.moveTo(-16,2+i*7);g.lineTo(16,2+i*7);A.st(g,'rgba(110,70,15,.3)',1);}
  A.circ(g,0,8,4);A.f(g,'#2b1c12');g.beginPath();g.moveTo(-1.5,10);g.lineTo(1.5,10);g.lineTo(2,18);g.lineTo(-2,18);g.closePath();A.f(g,'#2b1c12');
  A.hl(g,-16,-2,-16,22,.55,1.6);}});
D('screw',{n:'screw',w:30,h:11,mat:'metal',metal:1,tags:['screw','metal','small'],
 desc:['Left over from the bookshelf. The bookshelf seems fine.','Every drawer has at least nine of these.'],
 req:['Find me one screw.','I need a screw. Any screw.','There was a screw in there. Find it.'],
 draw(g){const S=A.steel(g,-5,5);
  g.beginPath();g.moveTo(-14,-5);g.lineTo(-9,-5);g.lineTo(-7,-2.5);g.lineTo(9,-2.5);g.lineTo(15,0);g.lineTo(9,2.5);g.lineTo(-7,2.5);g.lineTo(-9,5);g.lineTo(-14,5);g.closePath();A.fs(g,S,1.1);
  for(let i=0;i<7;i++){g.beginPath();g.moveTo(-5+i*2.3,-2.5);g.lineTo(-3.8+i*2.3,2.5);A.st(g,'rgba(40,46,52,.6)',.8);}
  g.beginPath();g.moveTo(-14,0);g.lineTo(-10.5,0);A.st(g,'#3b3f44',1);}});
D('clothespin',{n:'clothespin',w:64,h:16,mat:'wood',tags:['clip','wood'],
 desc:['Holding a chip bag shut since last March.','The spring is stronger than it looks.'],
 req:['Find a clothespin. The chips are going stale.','I need something to keep this bag closed.'],
 draw(g){const W=A.lin(g,0,-8,0,8,['#f3d9a8','#d8b07a','#b48a54']);
  g.beginPath();g.moveTo(-31,-6.5);g.lineTo(28,-5);g.quadraticCurveTo(32,-3,31,-0.5);g.lineTo(-31,-0.5);g.closePath();A.fs(g,W,1.2);
  g.beginPath();g.moveTo(-31,6.5);g.lineTo(28,5);g.quadraticCurveTo(32,3,31,0.5);g.lineTo(-31,0.5);g.closePath();A.fs(g,W,1.2);
  A.rr(g,-6,-7.5,10,15,2);A.fs(g,A.steel(g,-7,7),1.1);for(let i=0;i<4;i++){g.beginPath();g.moveTo(-5+i*2.6,-7);g.lineTo(-4+i*2.6,7);A.st(g,'rgba(40,40,40,.45)',.8);}
  g.beginPath();g.moveTo(-26,-3);g.lineTo(-12,-3.2);A.st(g,'rgba(140,100,60,.4)',.8);}});
D('flashlight',{n:'pocket flashlight',w:86,h:26,mat:'metal',metal:1,roll:1,tags:['light','metal','needsbattery'],
 desc:['Works if you shake it and believe.','The batteries inside are from a different decade.'],
 req:['Where’s the little flashlight?','Find the flashlight. The power’s flickering.','It’s dark under the sink. Get me the flashlight.'],
 draw(g){A.rr(g,-42,-9,62,18,4);A.fs(g,A.lin(g,0,-9,0,9,['#7aa0d6','#35609e','#1f3b66','#3b6cb0']));
  for(let i=0;i<9;i++){g.beginPath();g.moveTo(-36+i*4,-8);g.lineTo(-36+i*4,8);A.st(g,'rgba(0,0,20,.35)',1);}
  A.rr(g,-45,-7,5,14,2);A.fs(g,A.steel(g,-7,7),1.2);
  g.beginPath();g.moveTo(18,-9);g.lineTo(32,-13);g.lineTo(43,-13);g.lineTo(43,13);g.lineTo(32,13);g.lineTo(18,9);g.closePath();A.fs(g,A.steel(g,-13,13));
  A.rr(g,40,-12,4,24,1.5);A.fs(g,A.lin(g,0,-12,0,12,['#fffbe0','#f4e7a3','#d9c76d']),1);
  A.rr(g,2,-12,9,5,2);A.fs(g,A.plastic(g,-12,-7,'#d8443a'),1);A.hl(g,-36,-5,14,-5,.45,1.4);A.hl(g,22,-8,40,-10,.7,1.2);}});
D('cassette',{n:'cassette tape',w:78,h:50,mat:'plastic',fragile:0,tags:['music','plastic'],
 desc:['Labelled MIX in someone\'s best handwriting. Side B is just the radio.','You could fix it with a pencil. People used to do that.'],
 req:['Find the mixtape.','Where’s the cassette? The one that says MIX.','Something with music on it. The old kind.'],
 draw(g){A.rr(g,-38,-24,76,48,4);A.fs(g,A.plastic(g,-24,24,'#3a3633','#141210'));
  A.rr(g,-32,-19,64,26,3);A.fs(g,'#f2e6c9',1.1);g.beginPath();g.rect(-32,-19,64,6);A.f(g,'#d9573c');
  g.font='italic bold 9px "Segoe Print","Bradley Hand","Comic Sans MS",cursive';g.fillStyle='#2b3f7a';g.textAlign='left';g.textBaseline='middle';g.fillText('MIX \'94',-27,-6);
  A.rr(g,-18,-4,36,12,5);A.fs(g,'#2a2522',1);
  [-10,10].forEach(x=>{A.circ(g,x,2,4.5);A.f(g,'#efe8da');for(let i=0;i<6;i++){const a=i*P/3;g.beginPath();g.moveTo(x,2);g.lineTo(x+Math.cos(a)*4,2+Math.sin(a)*4);A.st(g,'#2a2522',1);}});
  A.rr(g,-6,-2,12,8,1);A.f(g,'rgba(120,70,40,.8)');
  g.beginPath();g.moveTo(-24,24);g.lineTo(-20,15);g.lineTo(20,15);g.lineTo(24,24);A.st(g,'rgba(255,255,255,.18)',1.2);
  [-28,28].forEach(x=>{A.circ(g,x,18,2);A.f(g,'#5a5550');});A.hl(g,-35,-22,35,-22,.25,1.2);}});
D('toy_car',{n:'toy car',w:62,h:34,mat:'metal',metal:1,roll:1,tags:['toy','wheels','metal'],
 desc:['Missing one door. Still the fastest thing in the drawer.','The paint is chipped where it hit every wall in the house.'],
 req:['Find the toy car. The red one.','The kid next door wants his car back.','Where’s the little red car?'],
 draw(g){[[-17,-14],[15,-14],[-17,14],[15,14]].forEach(p=>{A.rr(g,p[0]-6,p[1]-4,12,8,3);A.fs(g,'#1d1b1a',1.1);});
  A.rr(g,-30,-13,60,26,10);A.fs(g,A.lin(g,0,-13,0,13,['#ff8a70','#e0392b','#a9221a','#c9302a']));
  A.rr(g,-12,-10,24,20,6);A.fs(g,A.lin(g,0,-10,0,10,['#ff9c86','#d73527','#a01f18']),1.2);
  g.beginPath();g.moveTo(10,-10);g.lineTo(18,-11);g.lineTo(18,11);g.lineTo(10,10);g.closePath();A.fs(g,'#9ad0f0',1.1);
  g.beginPath();g.moveTo(-12,-10);g.lineTo(-17,-10);g.lineTo(-17,10);g.lineTo(-12,10);g.closePath();A.fs(g,'#7fbadf',1.1);
  [[27,-8],[27,8]].forEach(p=>{A.circ(g,p[0],p[1],2.4);A.f(g,'#fff6b8');});
  g.beginPath();g.moveTo(-3,-13);g.lineTo(-3,-10);A.st(g,'#f2f2f2',1);A.hl(g,-24,-9,22,-10,.5,1.6);
  g.fillStyle='#d9d1c4';A.circ(g,-25,6,1.4);g.fill();A.circ(g,22,-3,1.1);g.fill();}});
D('receipt',{n:'receipt from 2004',w:56,h:72,mat:'paper',tags:['paper','writeon','receipt'],
 desc:['Dated 2004. Nobody will let you throw it away.','Two batteries, a mop, and something called a HOSE ADAPTER.'],
 req:['Where’s the receipt from 2004?','Find that old receipt. I need it for something.','The receipt. The ancient one. We might need it.'],
 draw(g){g.beginPath();g.moveTo(-24,-34);for(let i=0;i<8;i++)g.lineTo(-24+i*6+3,-34+(i%2?3:-1));g.lineTo(24,-34);g.lineTo(26,34);for(let i=8;i>0;i--)g.lineTo(-26+i*6.5-3,34+(i%2?-3:1));g.lineTo(-26,34);g.closePath();A.fs(g,A.lin(g,-20,-30,20,30,['#fffdf3','#f3ecd8','#e5dbc0']),1.3);
  g.beginPath();g.moveTo(-25,-2);g.lineTo(25,1);A.st(g,'rgba(120,100,60,.35)',1.2);g.beginPath();g.moveTo(-25,0);g.lineTo(25,3);A.st(g,'rgba(255,255,255,.7)',.8);
  g.fillStyle='rgba(60,60,70,.55)';for(let i=0;i<9;i++){if(i===4)continue;const y=-26+i*6.5,l=10+((i*37)%22);g.fillRect(-18,y,l,1.8);g.fillRect(12,y,6,1.8);}
  g.fillStyle='rgba(60,60,70,.75)';g.fillRect(-18,28,36,2.2);
  g.fillStyle='rgba(210,170,80,.25)';A.circ(g,10,-14,8);g.fill();}});
D('comb',{n:'comb',w:92,h:22,mat:'plastic',tags:['comb','plastic'],
 desc:['Missing two teeth. Has seen things.','Free with a haircut in 1998.'],
 req:['Find the comb.','Where’s the black comb?'],
 draw(g){g.beginPath();g.moveTo(-45,-10);g.lineTo(45,-10);g.lineTo(45,-3);g.lineTo(-45,-3);g.closePath();A.fs(g,A.plastic(g,-10,-3,'#3b3a40'),1.2);
  g.beginPath();for(let i=0;i<30;i++){if(i===9||i===17)continue;const x=-43+i*3;g.rect(x,-3,1.8,i<12?13:10);}A.f(g,'#2e2d33');
  g.beginPath();for(let i=0;i<30;i++){if(i===9||i===17)continue;const x=-43+i*3;g.moveTo(x+.5,-2);g.lineTo(x+.5,i<12?9:6);}A.st(g,'rgba(255,255,255,.18)',.6);
  g.beginPath();g.rect(-45,-3,90,(1));A.f(g,'#1a191d');A.hl(g,-42,-8,42,-8,.4,1.1);}});
D('measuring_tape',{n:'measuring tape',w:54,h:48,mat:'plastic',wt:2,metal:1,tags:['measure','metal'],
 desc:['Retracts fast enough to take a finger off.','The tape stops at 11 feet. It used to go to 25.'],
 req:['Find the measuring tape.','How wide is the couch? Get the tape measure.','The yellow tape measure, please.'],
 draw(g){A.rr(g,10,8,16,7,1.5);A.fs(g,'#f2d23a',1);g.beginPath();g.moveTo(24,6);g.lineTo(27,6);g.lineTo(27,17);g.lineTo(24,17);g.closePath();A.fs(g,A.steel(g,6,17),1);
  for(let i=0;i<4;i++){g.beginPath();g.moveTo(12+i*3.5,8);g.lineTo(12+i*3.5,11);A.st(g,'#2b1c12',.6);}
  A.rr(g,-24,-22,40,40,9);A.fs(g,A.plastic(g,-22,18,'#f5c624','#b98a0c'));
  A.rr(g,-24,-22,40,40,9);A.inside(g,()=>{g.fillStyle='rgba(40,30,20,.85)';g.fillRect(-24,10,40,10);});A.rr(g,-24,-22,40,40,9);A.st(g,A.OUT,1.5);
  A.circ(g,-4,-3,10);A.fs(g,A.rad(g,-7,-6,1,10,['#ffffff','#c5ccd3','#6d757d']),1.2);
  A.circ(g,-4,-3,3);A.f(g,'#3b3f44');A.hl(g,-20,-18,8,-19,.55,1.6);}});
D('button',{n:'button',w:22,h:22,mat:'plastic',tags:['button','sew','small'],
 desc:['Off a coat. Which coat is a mystery.','Every house has a jar of these. This one escaped.'],
 req:['I lost a button off my coat. Find a button.','Find the teal button.'],
 draw(g){A.circ(g,0,0,10.5);A.fs(g,A.rad(g,-3,-3,1,11,['#7fd6c8','#2f9c8c','#1d6b60']),1.3);
  A.circ(g,0,0,7.5);A.st(g,'rgba(0,40,30,.35)',1.1);g.fillStyle='#16413b';[[-2.5,-2.5],[2.5,-2.5],[-2.5,2.5],[2.5,2.5]].forEach(p=>{A.circ(g,p[0],p[1],1.4);g.fill();});
  A.hlc(g,0,0,8.5,P*1.1,P*1.5,.6,1.3);}});
D('camera',{n:'disposable camera',w:78,h:46,mat:'plastic',fragile:0,tags:['camera','plastic'],
 desc:['Four pictures left. Nobody knows what’s on the other 23.','From a wedding. Possibly two weddings.'],
 req:['Find the disposable camera. I want to see what’s on it.','Where’s that old camera?'],
 draw(g){A.rr(g,-38,-22,76,44,5);A.fs(g,A.plastic(g,-22,22,'#f2c43a','#c48f12'));
  A.rr(g,-38,-6,76,18,0);A.f(g,'#2f7a4b');g.beginPath();g.moveTo(-38,-6);g.lineTo(38,-6);g.moveTo(-38,12);g.lineTo(38,12);A.st(g,A.OUT,1);
  A.circ(g,-6,2,12);A.fs(g,'#2a2a2c',1.3);A.circ(g,-6,2,7.5);A.fs(g,A.rad(g,-9,-1,1,8,['#7da7d9','#21345a','#0b0f1a']),1);A.hlc(g,-6,2,5,P*1.1,P*1.5,.8,1.4);
  A.rr(g,14,-17,18,9,1.5);A.fs(g,A.lin(g,0,-17,0,-8,['#ffffff','#d6dde4']),1.1);
  A.rr(g,-32,-18,12,8,1.5);A.fs(g,'#4a5d6e',1);
  A.circ(g,27,8,6);A.fs(g,A.plastic(g,2,14,'#3a3a3a'),1.1);for(let i=0;i<8;i++){const a=i*P/4;g.beginPath();g.moveTo(27+Math.cos(a)*3,8+Math.sin(a)*3);g.lineTo(27+Math.cos(a)*6,8+Math.sin(a)*6);A.st(g,'#777',.7);}
  A.rr(g,-32,15,8,4,1);A.f(g,'#c94b3b');A.hl(g,-34,-19,34,-19,.45,1.3);}});
D('brass_fitting',{n:'brass thing',w:46,h:34,mat:'metal',wt:3,metal:0,tags:['mystery','brass','heavy'],
 desc:['Brass. Heavy. Came off something important, probably.','Every house has one. Nobody’s ever found where it goes.','Still no idea.'],
 req:['Has anyone seen the brass thing?','Find the brass thing. Don’t ask me what it is.','Where’s that heavy brass thing? I think I know where it goes.'],
 draw(g){const B=A.brass(g,-9,9);
  A.rr(g,-22,-7.5,44,15,2);A.fs(g,B);
  for(let i=0;i<5;i++){g.beginPath();g.moveTo(-20+i*2.4,-7);g.lineTo(-19+i*2.4,7);A.st(g,'rgba(100,60,10,.5)',.8);g.beginPath();g.moveTo(10+i*2.4,-7);g.lineTo(11+i*2.4,7);A.st(g,'rgba(100,60,10,.5)',.8);}
  A.rr(g,-5,-16,10,10,2);A.fs(g,A.brass(g,-16,-6),1.2);
  g.beginPath();for(let i=0;i<6;i++){const a=i*P/3+P/6;g.lineTo(Math.cos(a)*11,Math.sin(a)*11);}g.closePath();A.fs(g,A.lin(g,-10,-10,10,10,['#fff3c2','#d9a640','#8a5e15']));
  A.circ(g,0,0,5);A.fs(g,'#4a3310',1);A.hl(g,-20,-5,-8,-5,.6,1.2);A.hl(g,8,-5,20,-5,.6,1.2);}});
D('fridge_magnet',{n:'strawberry magnet',w:40,h:42,mat:'plastic',magnet:44,tags:['magnet'],
 desc:['Holds exactly one piece of paper, if the paper cooperates.','Grabs anything metal that wanders too close.'],
 req:['Find the strawberry magnet.','Where’s the fridge magnet? The strawberry.'],
 draw(g){g.beginPath();g.moveTo(0,19);g.bezierCurveTo(-24,6,-20,-14,-6,-13);g.quadraticCurveTo(0,-12,6,-13);g.bezierCurveTo(20,-14,24,6,0,19);g.closePath();A.fs(g,A.rad(g,-6,-6,2,24,['#ff8a7a','#e3352f','#9d1b18']));
  g.fillStyle='#ffe58a';for(let i=0;i<14;i++){const x=-12+(i*7)%24,y=-6+((i*11)%20);g.beginPath();g.ellipse(x,y,1,1.6,.3,0,P*2);g.fill();}
  g.beginPath();for(let i=0;i<5;i++){const a=-P/2+(i-2)*.5;g.moveTo(0,-13);g.quadraticCurveTo(Math.cos(a-.3)*10,-13+Math.sin(a-.3)*6,Math.cos(a)*13,-14+Math.sin(a)*6-2);g.quadraticCurveTo(Math.cos(a+.3)*6,-13+Math.sin(a+.3)*3,0,-13);}A.fs(g,'#5fae46',1.1);
  A.hlc(g,-4,0,11,P*1.05,P*1.4,.6,2);}});
D('card',{n:'playing card',w:44,h:62,mat:'paper',tags:['card','game','paper','writeon'],
 desc:['The ace of spades. The rest of the deck is in another drawer, presumably.','Someone wrote a phone number on the back.'],
 req:['Find the ace of spades. We can’t play without it.','There’s a playing card in there somewhere. Find it.'],
 draw(g){A.rr(g,-21,-30,42,60,4);A.fs(g,A.lin(g,-20,-30,20,30,['#ffffff','#f4efe4','#e4dccb']),1.3);
  g.beginPath();g.moveTo(0,-12);g.bezierCurveTo(-4,-6,-13,-1,-9,5);g.bezierCurveTo(-6,9,-2,7,-1,5);g.lineTo(-4,13);g.lineTo(4,13);g.lineTo(1,5);g.bezierCurveTo(2,7,6,9,9,5);g.bezierCurveTo(13,-1,4,-6,0,-12);g.closePath();A.f(g,'#1f1a17');
  A.text(g,'A',-14,-22,9,'#1f1a17');g.save();g.translate(14,22);g.rotate(P);A.text(g,'A',0,0,9,'#1f1a17');g.restore();
  A.rr(g,-18,-27,36,54,3);A.st(g,'rgba(0,0,0,.08)',1);}});
D('pencil',{n:'pencil stub',w:62,h:11,mat:'wood',roll:1,tags:['write','pencil','wood'],
 desc:['Sharpened down to the point of no return.','Someone chewed the end. Nobody admits to it.'],
 req:['I need to write a phone number down. Find a pencil.','Find the pencil stub.','Something to write with. The pencil.'],
 draw(g){g.beginPath();g.moveTo(-30,-5);g.lineTo(10,-5);g.lineTo(10,5);g.lineTo(-30,5);g.closePath();A.fs(g,A.lin(g,0,-5,0,5,['#ffe27a','#f2b81e','#c98d0c']),1.2);
  g.beginPath();g.moveTo(-30,-1.7);g.lineTo(10,-1.7);g.moveTo(-30,1.7);g.lineTo(10,1.7);A.st(g,'rgba(140,90,10,.45)',.8);
  g.beginPath();g.moveTo(10,-5);g.lineTo(24,-1.3);g.lineTo(24,1.3);g.lineTo(10,5);g.closePath();A.fs(g,'#f0cfa0',1.1);
  g.beginPath();g.moveTo(24,-1.3);g.lineTo(30,0);g.lineTo(24,1.3);g.closePath();A.fs(g,'#3a3a40',1);
  A.rr(g,-34,-5,6,10,1);A.fs(g,A.steel(g,-5,5),1);g.beginPath();g.moveTo(-31,-5);g.lineTo(-31,5);A.st(g,'rgba(0,0,0,.4)',.7);
  A.rr(g,-38,-4.5,5,9,2.5);A.fs(g,'#f08a9a',1);}});
function coin(g,r,metal,face){A.circ(g,0,0,r);A.fs(g,metal);g.beginPath();g.arc(0,0,r-1.4,0,P*2);g.setLineDash([1,1.2]);A.st(g,'rgba(0,0,0,.35)',1.2);g.setLineDash([]);
 A.circ(g,0,0,r-3);A.st(g,'rgba(0,0,0,.2)',.8);
 g.beginPath();g.moveTo(-r*.25,r*.45);g.quadraticCurveTo(-r*.45,0,-r*.15,-r*.35);g.quadraticCurveTo(r*.05,-r*.55,r*.25,-r*.35);g.quadraticCurveTo(r*.15,-r*.2,r*.3,-r*.05);g.lineTo(r*.2,r*.05);g.quadraticCurveTo(r*.25,r*.3,r*.1,r*.45);g.closePath();A.f(g,face);
 A.hlc(g,0,0,r-2.5,P*1.1,P*1.45,.6,1.2);}
D('quarter',{n:'quarter',w:28,h:28,mat:'metal',metal:1,roll:1,tags:['coin','money','metal','tighten'],
 desc:['Laundry money. Don’t spend it on anything fun.','Good for turning big flat screws, in a pinch.'],
 req:['I need a quarter for the laundry.','Find a quarter. The silver one, not a penny.','The parking meter wants a quarter.'],
 draw(g){coin(g,13,A.rad(g,-4,-4,1,14,['#ffffff','#c9cfd5','#8b939b']),'rgba(70,76,84,.45)');}});
D('penny',{n:'penny',w:24,h:24,mat:'metal',metal:0,roll:1,tags:['coin','money'],
 desc:['Heads up. Supposedly lucky.','Worth less than the metal it’s made of.'],
 req:['Find a penny. Any penny.','I need a penny for the jar.'],
 draw(g){coin(g,11,A.rad(g,-3,-3,1,12,['#ffd8b8','#c8713e','#7a3a18']),'rgba(80,30,10,.45)');}});
D('cable',{n:'charging cable',w:92,h:70,mat:'rubber',tangler:1,tags:['cable'],
 desc:['Fits a phone nobody owns anymore.','It tangles itself. Science can’t explain it.'],
 req:['Where’s my charging cable?','Find the white cable. The one that fits nothing.'],
 draw(g){const pth=()=>{g.beginPath();g.moveTo(-38,-24);g.bezierCurveTo(-10,-34,10,-10,-6,0);g.bezierCurveTo(-22,12,-36,6,-30,-6);g.bezierCurveTo(-22,-20,6,-16,16,-2);g.bezierCurveTo(26,12,4,26,-8,18);g.bezierCurveTo(-20,10,8,-26,26,-14);g.bezierCurveTo(40,-4,30,18,36,26);};
  pth();A.st(g,A.OUT,5.6);pth();A.st(g,'#f4f2ee',3.4);pth();A.st(g,'rgba(180,176,170,.6)',1);
  g.save();g.translate(-40,-24);g.rotate(-.35);A.rr(g,-12,-4.5,13,9,2);A.fs(g,A.lin(g,0,-4,0,4,['#ffffff','#dcd9d3']),1.2);A.rr(g,-18,-3,7,6,1);A.fs(g,A.steel(g,-3,3),1);g.restore();
  g.save();g.translate(36,27);g.rotate(1.3);A.rr(g,-1,-4,12,8,2);A.fs(g,A.lin(g,0,-4,0,4,['#ffffff','#dcd9d3']),1.2);A.rr(g,10,-2,6,4,1);A.fs(g,A.steel(g,-2,2),1);g.restore();}});
D('lightbulb',{n:'lightbulb',w:40,h:64,mat:'glass',fragile:1,tags:['bulb','glass'],
 desc:['Might be burned out. Might be new. Nobody tested it.','Thin glass. Heavy things should stay well away.'],
 req:['Find the spare lightbulb. Carefully.','The bathroom light is out. Is there a bulb in there?'],
 draw(g){g.beginPath();g.moveTo(-8,10);g.bezierCurveTo(-8,2,-19,-4,-19,-14);g.arc(0,-14,19,P,0);g.bezierCurveTo(19,-4,8,2,8,10);g.closePath();A.fs(g,A.rad(g,-6,-20,2,24,['rgba(255,255,248,.95)','rgba(250,246,220,.78)','rgba(220,214,180,.85)']),1.4);
  g.beginPath();g.moveTo(-4,8);g.lineTo(-4,-8);g.lineTo(-6,-14);g.moveTo(4,8);g.lineTo(4,-8);g.lineTo(6,-14);A.st(g,'rgba(120,110,90,.7)',.9);
  g.beginPath();g.moveTo(-6,-14);for(let i=0;i<6;i++)g.lineTo(-6+i*2.4+1.2,-14+(i%2?-2:2));A.st(g,'#b07a30',1);
  A.rr(g,-9,9,18,16,2);A.fs(g,A.steel(g,9,25),1.3);for(let i=0;i<4;i++){g.beginPath();g.moveTo(-9,12+i*3.5);g.lineTo(9,10.5+i*3.5);A.st(g,'rgba(40,40,40,.5)',1);}
  g.beginPath();g.moveTo(-5,25);g.lineTo(0,31);g.lineTo(5,25);A.fs(g,'#3a3a3a',1.2);
  A.hlc(g,0,-14,14,P*1.1,P*1.5,.95,2.4);}});
D('glasses',{n:'reading glasses',w:86,h:32,mat:'glass',fragile:1,tags:['glasses','glass'],
 desc:['Gran\'s reading glasses. She’s looking for them while wearing the other pair.','The lenses are real glass. Gentle.'],
 req:['Have you seen my reading glasses?','Find Gran\'s glasses. Gently.','Where are the reading glasses?'],
 draw(g){g.beginPath();g.moveTo(-40,-6);g.lineTo(40,-6);A.st(g,A.OUT,3.6);g.beginPath();g.moveTo(-40,-6);g.lineTo(40,-6);A.st(g,'#7a3f22',2);
  [-21,21].forEach(x=>{A.rr(g,x-17,-10,34,22,10);A.fs(g,'rgba(210,232,240,.55)',3.2);A.rr(g,x-17,-10,34,22,10);A.st(g,'#7a3f22',1.8);
   g.beginPath();g.moveTo(x-10,-5);g.lineTo(x-2,-7);A.st(g,'rgba(255,255,255,.8)',1.6);g.beginPath();g.moveTo(x+4,6);g.lineTo(x+10,4);A.st(g,'rgba(255,255,255,.45)',1.2);});
  g.beginPath();g.moveTo(-5,-4);g.quadraticCurveTo(0,-9,5,-4);A.st(g,A.OUT,3.4);g.beginPath();g.moveTo(-5,-4);g.quadraticCurveTo(0,-9,5,-4);A.st(g,'#7a3f22',1.8);}});
D('horseshoe_magnet',{n:'horseshoe magnet',w:58,h:56,mat:'metal',wt:2,metal:1,magnet:72,tags:['magnet','metal'],
 desc:['From a science kit. It ate the rest of the science kit.','Strong. Anything metal nearby ends up stuck to it.'],
 req:['Find the big magnet.','Where’s the horseshoe magnet? The red one.'],
 draw(g){g.beginPath();g.moveTo(16,-26);g.lineTo(-4,-26);g.arc(-4,0,26,-P/2,P/2,true);g.lineTo(16,26);g.lineTo(16,11);g.lineTo(-4,11);g.arc(-4,0,11,P/2,-P/2);g.lineTo(16,-11);g.closePath();A.fs(g,A.lin(g,-30,-26,10,26,['#ff7b6b','#d92b22','#8f1612']));
  A.rr(g,14,-26,14,15,1.5);A.fs(g,A.steel(g,-26,-11),1.3);A.rr(g,14,11,14,15,1.5);A.fs(g,A.steel(g,11,26),1.3);
  g.beginPath();g.arc(-4,0,19,-P*.5,-P*.95,true);A.st(g,'rgba(255,255,255,.5)',2);}});
D('paperclip',{n:'paperclip',w:38,h:14,mat:'metal',metal:1,tags:['clip','metal','small','sharp'],
 desc:['Bent into a shape that has no name.','Reset button tool, lock pick, nervous fidget.'],
 req:['Find a paperclip.','Something pointy to press the reset button. A paperclip?'],
 draw(g){const p=()=>{g.beginPath();g.moveTo(10,4.5);g.lineTo(-13,4.5);g.arc(-13,0,4.5,P/2,P*1.5);g.lineTo(14,-4.5);g.arc(14,-.5,4,-P/2,P/2);g.lineTo(-8,3.5);g.arc(-8,1,2.5,P/2,P*1.5);g.lineTo(9,-1.5);};
  p();A.st(g,A.OUT,3.4);p();A.st(g,A.steel(g,-5,5),1.8);p();A.st(g,'rgba(255,255,255,.4)',.6);}});
D('eraser',{n:'eraser',w:38,h:22,mat:'rubber',tags:['erase','rubber'],
 desc:['Pink, smudged, smells faintly of school.','Erases pencil and leaves a pink smear on everything else.'],
 req:['Find the eraser. I wrote the wrong date again.','Where’s the pink eraser?'],
 draw(g){A.rr(g,-18,-10,36,20,4);A.fs(g,A.lin(g,0,-10,0,10,['#ffc3cc','#f08a9a','#c96474']));
  g.beginPath();g.moveTo(-14,-6);g.lineTo(14,-6);g.lineTo(18,-10);A.st(g,'rgba(255,255,255,.45)',1.2);
  g.beginPath();g.moveTo(-18,10);g.lineTo(-14,6);g.lineTo(14,6);g.lineTo(18,10);A.st(g,'rgba(120,40,50,.3)',1);
  g.fillStyle='rgba(90,90,100,.35)';A.ell(g,8,1,6,2.5,.2);g.fill();}});
D('matchbook',{n:'matchbook',w:46,h:32,mat:'paper',tags:['fire','paper'],
 desc:['From a restaurant that closed in 2009. Three matches left.','Don’t strike near anything you like.'],
 req:['Find the matches.','Something to light the candles with.'],
 draw(g){A.rr(g,-22,-15,44,30,2);A.fs(g,A.lin(g,0,-15,0,15,['#e05a44','#b3301f','#7e1d12']));
  g.beginPath();g.rect(-22,8,44,7);A.fs(g,'#5b3a2a',1.1);g.beginPath();g.rect(-22,8,44,7);A.inside(g,()=>{g.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<30;i++)g.fillRect(-21+(i*7)%42,9+(i*3)%5,1,1);});
  g.beginPath();g.moveTo(-22,5);g.lineTo(22,5);A.st(g,'rgba(0,0,0,.4)',1);
  A.circ(g,0,-4,7.5);A.fs(g,'#f1e3c0',1.1);A.text(g,'M',0,-3.6,8,'#b3301f');}});
D('rubber_band',{n:'rubber band',w:36,h:36,mat:'rubber',tags:['clip','rubber','bounce'],
 desc:['Stretched once too often. It knows things.','Snaps when you least expect it.'],
 req:['Find a rubber band.','I need something to hold these cards together. A rubber band?'],
 draw(g){const p=()=>{g.beginPath();g.moveTo(-14,-6);g.bezierCurveTo(-18,-18,10,-18,14,-8);g.bezierCurveTo(18,4,4,16,-6,14);g.bezierCurveTo(-18,12,-6,0,4,4);g.bezierCurveTo(12,8,-12,6,-14,-6);};
  p();A.st(g,A.OUT,4.4);p();A.st(g,'#d9a35a',2.6);p();A.st(g,'rgba(255,240,200,.4)',.7);}});
D('dice',{n:'die',w:22,h:22,mat:'plastic',roll:1,tags:['game','toy'],
 desc:['Uncle Dev says it’s lucky. He also says it’s his.','Rolls a six a little too often.'],
 req:['Find the die. We’re playing a board game and lost it.','Uncle Dev wants his lucky die back.'],
 draw(g){A.rr(g,-10,-10,20,20,4.5);A.fs(g,A.lin(g,-10,-10,10,10,['#ffffff','#f1ece2','#cfc6b4']),1.3);
  g.fillStyle='#2b1c12';[[-5,-5],[5,-5],[0,0],[-5,5],[5,5]].forEach(p=>{A.circ(g,p[0],p[1],1.8);g.fill();});}});
D('spring',{n:'spring',w:42,h:16,mat:'metal',metal:1,tags:['spring','metal'],
 desc:['Came out of something. That something now works worse.','Compressed. Wants very badly to not be.'],
 req:['Where’s that spring? The pen needs it.','Find the little spring.'],
 draw(g){const p=()=>{g.beginPath();g.moveTo(-20,6);for(let i=0;i<9;i++){const x=-18+i*4.5;g.quadraticCurveTo(x-2,-14,x+1,-6);g.quadraticCurveTo(x+3,8,x+2.5,6);}};
  p();A.st(g,A.OUT,3.6);p();A.st(g,A.steel(g,-7,7),2);p();A.st(g,'rgba(255,255,255,.35)',.6);}});

// ---------- GARAGE BITS (unlockable) ----------
D('allen_key',{n:'allen key',w:48,h:28,mat:'metal',metal:1,coll:'garage',tags:['tighten','metal','small'],
 desc:['Came with a bookshelf. The bookshelf wants it back.','There are fourteen of these in the house. All the wrong size.'],
 req:['Find the allen key. The little L-shaped one.','The bookshelf wobbles. Get me the allen key.'],
 draw(g){const p=()=>{g.beginPath();g.moveTo(-22,-10);g.lineTo(-22,8);g.quadraticCurveTo(-22,11,-19,11);g.lineTo(22,11);};p();A.st(g,A.OUT,6.4);p();A.st(g,A.lin(g,0,-10,0,12,['#5a5f66','#2a2d31','#4d5258']),4.2);
  g.beginPath();g.moveTo(-23,-6);g.lineTo(-23,7);g.moveTo(-17,9.8);g.lineTo(18,9.8);A.st(g,'rgba(255,255,255,.35)',.8);}});
D('zip_tie',{n:'zip tie',w:92,h:12,mat:'plastic',coll:'garage',tags:['clip','plastic'],
 desc:['Holds the car together. Don’t tell the car.','Single use. This one is still hopeful.'],
 req:['Find a zip tie.','Something to hold this cable bundle together. A zip tie?'],
 draw(g){g.beginPath();g.moveTo(-36,-2.5);g.lineTo(44,-1.5);g.lineTo(46,0);g.lineTo(44,1.5);g.lineTo(-36,2.5);g.closePath();A.fs(g,'#26262a',1.1);
  for(let i=0;i<24;i++){g.beginPath();g.moveTo(-32+i*3,-1.8);g.lineTo(-32+i*3,1.8);A.st(g,'rgba(255,255,255,.12)',.7);}
  A.rr(g,-46,-5.5,11,11,2);A.fs(g,'#2e2e33',1.1);A.rr(g,-43,-2.5,5,5,1);A.f(g,'#111');}});
D('wing_nut',{n:'wing nut',w:32,h:22,mat:'metal',metal:1,coll:'garage',tags:['metal','small','tighten'],
 desc:['Hand-tightened. Never loosened since.','From the barbecue, maybe. The barbecue is fine without it.'],
 req:['Find the wing nut.','Where’s the little nut with the wings?'],
 draw(g){const S=A.steel(g,-10,10);g.beginPath();g.moveTo(-6,-4);g.quadraticCurveTo(-14,-11,-15,-4);g.quadraticCurveTo(-15,2,-6,4);g.closePath();A.fs(g,S,1.2);
  g.beginPath();g.moveTo(6,-4);g.quadraticCurveTo(14,-11,15,-4);g.quadraticCurveTo(15,2,6,4);g.closePath();A.fs(g,S,1.2);
  A.circ(g,0,0,7);A.fs(g,A.rad(g,-2,-2,1,7,['#ffffff','#b9c0c7','#6d757d']),1.2);A.circ(g,0,0,3);A.fs(g,'#30353a',1);}});
D('pushpin',{n:'pushpin',w:22,h:22,mat:'plastic',coll:'garage',tags:['sharp','sticky','pin'],
 desc:['Point side down. Usually.','Held up a calendar from 2017 for six years.'],
 req:['Find a pushpin.','I need to pin this note up. Pushpin?'],
 draw(g){A.circ(g,0,0,10);A.fs(g,A.rad(g,-3,-3,1,11,['#9fd0ff','#2f7fd6','#174a86']),1.3);A.circ(g,0,0,5.5);A.fs(g,A.rad(g,-2,-2,1,6,['#c4e3ff','#3a8de4','#1d5aa0']),1);A.hlc(g,0,0,7.5,P*1.1,P*1.5,.7,1.4);}});
D('washer',{n:'washer',w:24,h:24,mat:'metal',metal:1,roll:1,coll:'garage',tags:['metal','small'],
 desc:['A tiny metal donut. It holds the whole house together.','There’s always one left over.'],
 req:['Find a washer. The flat round metal thing.','I need one washer.'],
 draw(g){g.beginPath();g.arc(0,0,11,0,P*2);g.moveTo(4.5,0);g.arc(0,0,4.5,0,P*2,true);A.fs(g,A.rad(g,-3,-3,2,12,['#ffffff','#c3cad1','#737b83']),1.3,'evenodd');A.hlc(g,0,0,8,P*1.1,P*1.5,.7,1.4);}});

// ---------- KITCHEN ODDS (unlockable) ----------
D('soy_packet',{n:'soy sauce packet',w:46,h:30,mat:'plastic',coll:'kitchen',tags:['food','sauce'],
 desc:['Takeout leftovers. There are hundreds. This is one.','Best before nobody knows.'],
 req:['Find a soy sauce packet. Just one.','Is there soy sauce in there? A packet?'],
 draw(g){g.beginPath();g.moveTo(-22,-14);for(let i=0;i<=11;i++)g.lineTo(-22+i*4,-14+(i%2?-1.2:0));g.lineTo(22,14);for(let i=11;i>=0;i--)g.lineTo(-22+i*4,14+(i%2?1.2:0));g.closePath();A.fs(g,'rgba(240,236,226,.92)',1.2);
  A.rr(g,-16,-9,32,18,6);A.f(g,A.lin(g,0,-9,0,9,['#7a3a1a','#4a1f0b','#2a0f04']));A.ell(g,-2,-3,10,2.6,-.1);A.f(g,'rgba(255,255,255,.35)');
  A.circ(g,8,3,4.5);A.fs(g,'#c8392e',1);}});
D('chopsticks',{n:'chopsticks',w:112,h:18,mat:'wood',coll:'kitchen',tags:['food','wood','poke'],
 desc:['Still joined at the top. Optimists keep these.','From the place with the good dumplings.'],
 req:['Find the chopsticks. The unopened pair.','Takeout is here. Any chopsticks in there?'],
 draw(g){g.beginPath();g.moveTo(-54,-7);g.lineTo(54,-3);g.lineTo(54,-.6);g.lineTo(-54,-1);g.closePath();A.fs(g,A.lin(g,0,-7,0,0,['#f4dcae','#d6af74']),1.1);
  g.beginPath();g.moveTo(-54,1);g.lineTo(54,.6);g.lineTo(54,3);g.lineTo(-54,7);g.closePath();A.fs(g,A.lin(g,0,0,0,7,['#f4dcae','#c99c5c']),1.1);
  A.rr(g,-50,-9,46,18,2);A.fs(g,'rgba(230,70,55,.92)',1.2);g.beginPath();g.moveTo(-44,-4);g.lineTo(-12,-4);g.moveTo(-44,1);g.lineTo(-20,1);A.st(g,'rgba(255,240,220,.7)',1.4);}});
D('candle',{n:'birthday candle',w:58,h:12,mat:'wood',coll:'kitchen',tags:['candle','light'],
 desc:['Used once, for about eleven seconds.','There’s frosting on the end. Old frosting.'],
 req:['Find a birthday candle. Any color.','It’s somebody\'s birthday in five minutes. Candle?'],
 draw(g){A.rr(g,-24,-4,44,8,3);A.fs(g,'#bfe6ff',1.2);A.rr(g,-24,-4,44,8,3);A.inside(g,()=>{for(let i=0;i<9;i++){g.beginPath();g.moveTo(-26+i*6,4);g.lineTo(-22+i*6,-4);A.st(g,'#ef6aa0',2.4);}});A.rr(g,-24,-4,44,8,3);A.st(g,A.OUT,1.2);
  g.beginPath();g.moveTo(20,0);g.lineTo(27,-.5);A.st(g,'#2b1c12',1.4);A.ell(g,-22,0,3,3.4);A.f(g,'rgba(255,248,235,.9)');A.hl(g,-20,-2.4,16,-2.4,.5,1);}});
D('cork',{n:'wine cork',w:32,h:20,mat:'wood',roll:1,coll:'kitchen',tags:['cork','wood'],
 desc:['From an anniversary. The year is written on the side.','Smells faintly of a good evening.'],
 req:['Find the wine cork. The one with a date on it.','Where’s the cork? It’s from our anniversary.'],
 draw(g){A.rr(g,-15,-9,30,18,4);A.fs(g,A.lin(g,0,-9,0,9,['#ecc792','#c9965a','#99693a']),1.3);
  g.fillStyle='rgba(110,70,30,.5)';for(let i=0;i<22;i++){A.circ(g,-12+(i*7.3)%24,-6+(i*5.1)%12,.8+((i*3)%3)*.4);g.fill();}
  A.rr(g,10,-9,5,18,2);A.f(g,'rgba(130,30,50,.6)');}});
D('fortune',{n:'fortune slip',w:52,h:16,mat:'paper',coll:'kitchen',tags:['paper','writeon'],
 desc:['"You’ll find what you are looking for." Bold claim, in this drawer.','Lucky numbers on the back. Never played them.'],
 req:['Find the fortune from the cookie. I want my lucky numbers.','Where’s that little fortune paper?'],
 draw(g){g.beginPath();g.moveTo(-25,-6);g.lineTo(25,-7);g.lineTo(24,6);g.lineTo(-24,7);g.closePath();A.fs(g,'#fffaf0',1.1);
  g.fillStyle='rgba(200,60,40,.75)';g.fillRect(-19,-2.5,27,1.4);g.fillRect(-19,1,18,1.4);g.fillRect(12,-2.5,6,1.4);}});

// ---------- SEWING TIN (unlockable) ----------
D('thimble',{n:'thimble',w:22,h:22,mat:'metal',metal:1,coll:'sewing',tags:['sew','metal','small'],
 desc:['Gran\'s. She says it fits everyone, which isn’t how thimbles work.','Tiny dents all over, like a golf ball for fingers.'],
 req:['Find Gran\'s thimble.','Where’s the thimble? The little metal cap.'],
 draw(g){A.circ(g,0,0,10);A.fs(g,A.rad(g,-3,-3,1,11,['#ffffff','#c9cfd5','#7b838b']),1.3);g.fillStyle='rgba(60,66,72,.45)';for(let r=2.5;r<9;r+=2.6)for(let i=0;i<Math.round(r*2.2);i++){const a=i/Math.round(r*2.2)*P*2;A.circ(g,Math.cos(a)*r,Math.sin(a)*r,.7);g.fill();}}});
D('safety_pin',{n:'safety pin',w:46,h:13,mat:'metal',metal:1,coll:'sewing',tags:['sharp','clip','metal','sew'],
 desc:['Holding nothing together, for once.','Emergency hem repair kit, all in one.'],
 req:['Find a safety pin. My hem is coming down.','I need a safety pin.'],
 draw(g){const p=()=>{g.beginPath();g.moveTo(16,-4);g.lineTo(-17,-4);g.arc(-17,0,4,-P/2,P/2,true);g.lineTo(-4,4);g.lineTo(14,1);};p();A.st(g,A.OUT,3.2);p();A.st(g,A.steel(g,-5,5),1.6);
  A.rr(g,13,-6,10,9,2);A.fs(g,A.steel(g,-6,3),1.1);A.circ(g,-17,0,2);A.st(g,A.OUT,1);}});
D('spool',{n:'spool of thread',w:36,h:36,mat:'wood',roll:1,coll:'sewing',tags:['sew','thread'],
 desc:['Navy blue, the one color you never need.','The end is always lost. Always.'],
 req:['Find the spool of thread.','I need thread. The navy spool.'],
 draw(g){A.circ(g,0,0,17);A.fs(g,A.lin(g,-17,-17,17,17,['#f2d6a8','#c99a5c']));A.circ(g,0,0,13.5);A.fs(g,'#2f4f8a',1.1);
  A.circ(g,0,0,13.5);A.inside(g,()=>{for(let r=4;r<14;r+=1.4){g.beginPath();g.arc(0,0,r,0,P*2);A.st(g,'rgba(255,255,255,.12)',.6);}});
  A.circ(g,0,0,4);A.fs(g,'#c99a5c',1.1);A.circ(g,0,0,2);A.f(g,'#2b1c12');g.beginPath();g.moveTo(12,4);g.quadraticCurveTo(20,10,16,16);A.st(g,'#2f4f8a',1.2);}});
D('pincushion',{n:'tomato pincushion',w:38,h:38,mat:'cloth',coll:'sewing',tags:['sew','sharp'],
 desc:['Shaped like a tomato. Full of pins. Somehow cozy.','The little strawberry on the side is for sharpening. Nobody knew.'],
 req:['Find the tomato pincushion.','Where are the pins? In the tomato.'],
 draw(g){A.circ(g,0,0,17);A.fs(g,A.rad(g,-5,-5,2,18,['#ff8f80','#d8382c','#8e1a14']));for(let i=0;i<6;i++){const a=i*P/3;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*17,Math.sin(a)*17);A.st(g,'rgba(80,10,10,.45)',1.1);}
  g.beginPath();for(let i=0;i<5;i++){const a=i*P*2/5;g.moveTo(0,0);g.lineTo(Math.cos(a)*7,Math.sin(a)*7);}A.st(g,'#4f9a3a',2.6);
  [[-8,-9,'#f2d23a'],[9,-6,'#3a8de4'],[6,9,'#f2f2f2'],[-9,7,'#5fae46']].forEach(p=>{A.circ(g,p[0],p[1],2.2);A.fs(g,p[2],.9);});}});

// ---------- ODDITIES (rare discoveries, not part of requests) ----------
D('gold_ring',{n:'gold ring',w:26,h:26,mat:'metal',rare:1,coll:'odd',tags:['rare'],
 desc:['Gran\'s ring. She has been looking for this since 1991.'],
 draw(g){g.beginPath();g.arc(0,2,11,0,P*2);g.moveTo(7.5,2);g.arc(0,2,7.5,0,P*2,true);A.fs(g,A.lin(g,0,-9,0,13,['#fff1b0','#e6b13a','#9a6810']),1.3,'evenodd');
  g.beginPath();for(let i=0;i<6;i++){const a=i*P/3;g.lineTo(Math.cos(a)*4.5,-9+Math.sin(a)*4.5);}g.closePath();A.fs(g,A.rad(g,-1,-10,0,5,['#ffffff','#a8e6ff','#3a8fc8']),1.1);A.hlc(g,0,2,9,P*1.1,P*1.5,.7,1.4);}});
D('old_photo',{n:'old photo',w:56,h:48,mat:'paper',rare:1,coll:'odd',tags:['rare'],
 desc:['Someone\'s vacation, maybe 1987. Nobody here recognizes the dog.'],
 draw(g){A.rr(g,-27,-23,54,46,2);A.fs(g,'#f6efe0',1.2);g.beginPath();g.rect(-23,-19,46,32);A.f(g,A.lin(g,0,-19,0,13,['#a9c7c9','#d9c9a0','#b59a6a']));
  g.beginPath();g.moveTo(-23,4);g.quadraticCurveTo(0,-2,23,5);g.lineTo(23,13);g.lineTo(-23,13);g.closePath();A.f(g,'#8c7a52');
  g.beginPath();g.ellipse(4,4,7,3.5,0,0,P*2);g.moveTo(10,2);g.arc(11,0,3,0,P*2);A.f(g,'#4a3626');g.fillRect(-1,6,1.5,4);g.fillRect(7,6,1.5,4);
  g.beginPath();g.rect(-23,-19,46,32);A.f(g,'rgba(230,180,90,.18)');}});
D('love_note',{n:'folded note',w:44,h:34,mat:'paper',rare:1,coll:'odd',tags:['rare'],
 desc:['"Meet me by the shed." There has never been a shed.'],
 draw(g){g.beginPath();g.moveTo(-20,-15);g.lineTo(20,-16);g.lineTo(21,15);g.lineTo(-21,16);g.closePath();A.fs(g,'#fdf6e4',1.2);g.beginPath();g.moveTo(-20,0);g.lineTo(21,-1);A.st(g,'rgba(120,100,60,.35)',1);
  g.beginPath();g.moveTo(0,10);g.bezierCurveTo(-12,2,-8,-8,0,-3);g.bezierCurveTo(8,-8,12,2,0,10);A.fs(g,'#d8382c',1);}});
D('trophy',{n:'tiny trophy',w:32,h:44,mat:'metal',rare:1,coll:'odd',tags:['rare'],
 desc:['Second place, regional spelling bee, 1994. The S fell off.'],
 draw(g){A.rr(g,-12,12,24,9,1.5);A.fs(g,'#4a2f1e',1.2);A.rr(g,-3,4,6,9,1);A.fs(g,A.brass(g,4,13),1);
  g.beginPath();g.moveTo(-11,-18);g.lineTo(11,-18);g.quadraticCurveTo(11,4,0,5);g.quadraticCurveTo(-11,4,-11,-18);g.closePath();A.fs(g,A.lin(g,-11,0,11,0,['#fff1b0','#e6b13a','#9a6810']));
  g.beginPath();g.arc(-11,-11,5,P*.5,P*1.5);g.moveTo(11,-16);g.arc(11,-11,5,-P*.5,P*.5);A.st(g,A.OUT,2.6);g.beginPath();g.arc(-11,-11,5,P*.5,P*1.5);g.moveTo(11,-16);g.arc(11,-11,5,-P*.5,P*.5);A.st(g,'#d9a640',1.4);
  A.hl(g,-6,-15,-5,-2,.7,1.4);}});

window.OBJ={DEFS,LIST,
 base:LIST.filter(d=>d.coll==='base'),
 colls:{garage:{name:'Garage Bits'},kitchen:{name:'Kitchen Odds'},sewing:{name:'Sewing Tin'}},
 rares:LIST.filter(d=>d.rare)};
})();
