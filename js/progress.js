// Persistent progress (localStorage): settings, best scores, challenge stars, stats, achievements, unlocks, daily records.
(function(){
const KEY='junkdrawer.save.v1';
function fresh(){return{v:1,set:{music:true,sfx:true,haptics:true,hints:true,motion:true},tut:0,design:'oak',
 best:{quick:0,bottomless:0,depth:0,daily:0},chal:{},daily:{},ach:{},seen:[],
 stats:{rounds:0,found:0,wrong:0,broken:0,moved:0,knots:0,unstuck:0,hidden:0,deep:0,combos:0,mystery:0,decoys:0,inspected:0,trayed:0,trayFull:0,time:0,bestStreak:0,fastest:99,oddities:[],shed:0,dailies:0,quickPlays:0,bottomlessPlays:0}};}
const PG={KEY};
PG.load=function(){let s;try{s=JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){s=null;}const f=fresh();if(!s||typeof s!=='object')return f;
 // merge so newer fields always exist
 for(const k in f){if(s[k]===undefined)s[k]=f[k];else if(typeof f[k]==='object'&&!Array.isArray(f[k])&&k!=='chal'&&k!=='daily'&&k!=='ach')for(const j in f[k])if(s[k][j]===undefined)s[k][j]=f[k][j];}
 return s;};
PG.save=function(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}};
PG.fresh=fresh;
PG.chalDone=s=>Object.values(s.chal).filter(c=>c.stars>0).length;
PG.stars=s=>Object.values(s.chal).reduce((a,c)=>a+(c.stars||0),0);
const ACH=[
 {id:'first',n:'First Find',d:'Find your first thing.',c:s=>s.stats.found>=1},
 {id:'hidden',n:'Buried Treasure',d:'Find something that started out completely hidden.',c:s=>s.stats.deep>=1},
 {id:'streak5',n:'On a Roll',d:'Find 5 things in a row without a wrong pick.',c:s=>s.stats.bestStreak>=5},
 {id:'streak12',n:'In the Zone',d:'Find 12 things in a row without a wrong pick.',c:s=>s.stats.bestStreak>=12},
 {id:'fast',n:'Knew Where It Was',d:'Hand something over within 2 seconds of being asked.',c:s=>s.stats.fastest<=2},
 {id:'crunch',n:'Crunch',d:'Break something fragile. It happens.',c:s=>s.stats.broken>=1},
 {id:'magnet',n:'Opposites Attract',d:'Pull 10 things off magnets.',c:s=>s.stats.unstuck>=10},
 {id:'knots',n:'Untangler',d:'Work 10 knots loose.',c:s=>s.stats.knots>=10},
 {id:'combo',n:'Two Birds',d:'Finish a request that needs more than one thing.',c:s=>s.stats.combos>=1},
 {id:'decoy',n:'The Right One',d:'Pick the right one out of 10 lookalike lineups.',c:s=>s.stats.decoys>=10},
 {id:'mystery',n:'Detective',d:'Solve 10 described requests.',c:s=>s.stats.mystery>=10},
 {id:'tidy',n:'Tidy Up',d:'Fill every slot in the sorting tray.',c:s=>s.stats.trayFull>=1},
 {id:'curious',n:'Curious',d:'Take a closer look at 25 things.',c:s=>s.stats.inspected>=25},
 {id:'oddity',n:'Huh.',d:'Find one of the drawer\'s oddities.',c:s=>s.stats.oddities.length>=1},
 {id:'allodd',n:'Archivist',d:'Find all four oddities.',c:s=>s.stats.oddities.length>=4},
 {id:'shed',n:'We Don\'t Have a Shed',d:'Find the shed key 3 times.',c:s=>s.stats.shed>=3},
 {id:'fiddle',n:'Fidgeter',d:'Move things around 500 times.',c:s=>s.stats.moved>=500},
 {id:'quick',n:'Quick Hands',d:'Score 3,000 in Quick Rummage.',c:s=>s.best.quick>=3000},
 {id:'deep',n:'Bottom of the Drawer',d:'Reach depth 15 in the Bottomless Drawer.',c:s=>s.best.depth>=15},
 {id:'daily',n:'Daily Habit',d:'Finish a daily drawer.',c:s=>s.stats.dailies>=1},
 {id:'clean10',n:'Halfway There',d:'Finish 10 Big Cleanout challenges.',c:s=>PG.chalDone(s)>=10},
 {id:'clean20',n:'Spotless',d:'Finish all 20 Big Cleanout challenges.',c:s=>PG.chalDone(s)>=20},
 {id:'three',n:'Clean Sweep',d:'Get three stars on a challenge.',c:s=>Object.values(s.chal).some(c=>c.stars>=3)},
 {id:'stars40',n:'Gold Stars',d:'Earn 40 stars in the Big Cleanout.',c:s=>PG.stars(s)>=40}];
PG.ACH=ACH;
// drawer designs (wood + liner) and object collections, unlocked by play
const DESIGNS=[
 {id:'oak',n:'Kitchen Oak',wood:'#c48a52',dark:'#8a5530',liner:'check',lc:['#f4efe2','#9fc0d8'],req:null},
 {id:'walnut',n:'Walnut and Felt',wood:'#7a4b2c',dark:'#4a2a16',liner:'felt',lc:['#3f6e4e','#2f5a3d'],req:s=>PG.stars(s)>=8,rt:'Earn 8 stars'},
 {id:'mint',n:'Painted Mint',wood:'#9fcbb4',dark:'#5f8f78',liner:'news',lc:['#efe8d6','#8a8578'],req:s=>s.stats.found>=60,rt:'Find 60 things'},
 {id:'cherry',n:'Cherry and Gingham',wood:'#a8492e',dark:'#6e2817',liner:'check',lc:['#fbf3ea','#d9675a'],req:s=>PG.chalDone(s)>=12,rt:'Finish 12 challenges'},
 {id:'pine',n:'Pine and Flowers',wood:'#ddb57a',dark:'#a8804a',liner:'floral',lc:['#f6efdc','#d98c6a'],req:s=>s.best.depth>=12,rt:'Reach depth 12 in the Bottomless Drawer'},
 {id:'workshop',n:'Workshop',wood:'#c9a46c',dark:'#8c6a3a',liner:'cork',lc:['#c8955b','#9a6a3a'],req:s=>s.best.quick>=2500,rt:'Score 2,500 in Quick Rummage'},
 {id:'heirloom',n:'Heirloom',wood:'#4a2a1c',dark:'#28140b',liner:'velvet',lc:['#8e1f2a','#5e1018'],req:s=>PG.stars(s)>=45,rt:'Earn 45 stars'}];
PG.DESIGNS=DESIGNS;
const COLLS=[
 {id:'garage',n:'Garage Bits',req:s=>PG.chalDone(s)>=6,rt:'Finish 6 challenges'},
 {id:'kitchen',n:'Kitchen Odds',req:s=>s.stats.found>=40,rt:'Find 40 things'},
 {id:'sewing',n:'Sewing Tin',req:s=>PG.stars(s)>=20,rt:'Earn 20 stars'}];
PG.COLLS=COLLS;
PG.colls=s=>COLLS.filter(c=>c.req(s)).map(c=>c.id);
PG.designOk=(s,id)=>{const d=DESIGNS.find(x=>x.id===id);return d&&(!d.req||d.req(s));};
// returns newly earned achievements and unlocks (each reported once)
PG.check=function(s){const out=[];for(const a of ACH){if(!s.ach[a.id]&&a.c(s)){s.ach[a.id]=Date.now();out.push({type:'ach',n:a.n,d:a.d});}}
 for(const d of DESIGNS){if(d.req&&d.req(s)&&!s.seen.includes('d:'+d.id)){s.seen.push('d:'+d.id);out.push({type:'design',n:d.n});}}
 for(const c of COLLS){if(c.req(s)&&!s.seen.includes('c:'+c.id)){s.seen.push('c:'+c.id);out.push({type:'coll',n:c.n});}}
 return out;};
window.PG=PG;
})();
