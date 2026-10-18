// All sound is synthesized with Web Audio. No files, no network. Separate SFX / music buses.
(function(){
const AU={ctx:null,sfxOn:true,musicOn:true,last:{},played:[]};
let C,master,sfx,mus,noiseBuf,musTimer=null,musStep=0,musNext=0;
AU.unlock=function(){if(!C){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;C=AU.ctx=new AC();master=C.createGain();master.gain.value=.9;master.connect(C.destination);
  const comp=C.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(master);
  sfx=C.createGain();sfx.gain.value=AU.sfxOn?1:0;sfx.connect(comp);mus=C.createGain();mus.gain.value=AU.musicOn?.55:0;mus.connect(comp);
  noiseBuf=C.createBuffer(1,C.sampleRate,C.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
 if(C.state==='suspended')C.resume();if(AU.musicOn)AU.startMusic();};
AU.levels=function(){return sfx?[mus.gain.value,sfx.gain.value]:null;};
AU.setSfx=function(on){AU.sfxOn=on;if(sfx)sfx.gain.setTargetAtTime(on?1:0,C.currentTime,.02);};
AU.setMusic=function(on){AU.musicOn=on;if(mus)mus.gain.setTargetAtTime(on?.55:0,C.currentTime,.05);if(on&&C)AU.startMusic();else AU.stopMusic();};
AU.suspend=function(){if(C&&C.state==='running')C.suspend();};
AU.resume=function(){if(C&&C.state==='suspended')C.resume();};
function ok(name,gap){const t=performance.now();AU.played.push(name);if(AU.played.length>50)AU.played.shift();if(!C||!AU.sfxOn)return false;if(AU.last[name]&&t-AU.last[name]<(gap||35))return false;AU.last[name]=t;return true;}
function env(g,t,a,d,v){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+a+d);}
function tone(f,dur,type,vol,o){o=o||{};const t=C.currentTime+(o.at||0),os=C.createOscillator(),g=C.createGain();os.type=type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+dur);
 env(g,t,o.a||.004,dur,vol);os.connect(g);g.connect(o.bus||sfx);os.start(t);os.stop(t+dur+.05);}
function noise(dur,ftype,freq,q,vol,o){o=o||{};const t=C.currentTime+(o.at||0),s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain();s.buffer=noiseBuf;s.loop=true;f.type=ftype;f.frequency.setValueAtTime(freq,t);f.Q.value=q||1;
 if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+dur);env(g,t,o.a||.003,dur,vol);s.connect(f);f.connect(g);g.connect(o.bus||sfx);s.start(t,Math.random()*.5);s.stop(t+dur+.05);}
const R=(a,b)=>a+Math.random()*(b-a);
// material taps: pick up / put down
AU.tap=function(mat,soft){if(!ok('tap',30))return;const v=soft?.5:1;
 if(mat==='metal'){tone(R(2300,3100),.09,'sine',.14*v);tone(R(4200,5600),.05,'sine',.06*v);noise(.02,'highpass',5000,1,.05*v);}
 else if(mat==='glass'){tone(R(3600,4400),.16,'sine',.1*v);tone(R(5900,6800),.09,'sine',.05*v);}
 else if(mat==='paper'){noise(.07,'bandpass',R(2500,4000),.8,.12*v);noise(.05,'bandpass',R(3500,5000),.8,.08*v,{at:.04});}
 else if(mat==='wood'){tone(R(380,520),.06,'triangle',.18*v);noise(.03,'bandpass',1200,2,.08*v);}
 else if(mat==='rubber'||mat==='cloth'){tone(R(150,210),.08,'sine',.2*v,{to:110});}
 else{tone(R(1100,1500),.03,'square',.05*v);noise(.025,'bandpass',R(2200,3200),3,.12*v);}};
AU.land=function(mat,wt){if(!ok('land',45))return;const k=Math.min(3,wt||1);
 noise(.07+k*.02,'lowpass',500+300/k,1,.1+.05*k);tone(R(140,190)/Math.sqrt(k),.08,'sine',.12+k*.04);
 if(mat==='metal')tone(R(1800,2500)/Math.sqrt(k),.12,'sine',.07);else if(mat==='glass')tone(R(3000,3800),.12,'sine',.06);else if(mat==='paper')noise(.06,'bandpass',3000,1,.06);};
AU.slide=function(sp){if(!ok('slide',90))return;noise(.18,'lowpass',R(700,1000),.7,Math.min(.07,.02+sp/14000),{to:300});};
AU.knock=function(mat){if(!ok('knock',60))return;if(mat==='metal')tone(R(2000,2800),.06,'sine',.07);else tone(R(500,800),.04,'triangle',.08);};
AU.wall=function(sp){if(!ok('wall',70))return;tone(R(110,150),.1,'sine',Math.min(.3,.06+sp/3000));noise(.06,'lowpass',700,1,Math.min(.16,.04+sp/5000));};
AU.drawer=function(){if(!ok('drawer',300))return;const d=.55;const t=C.currentTime,s=C.createBufferSource(),f=C.createBiquadFilter(),g=C.createGain(),lfo=C.createOscillator(),lg=C.createGain();
 s.buffer=noiseBuf;s.loop=true;f.type='bandpass';f.frequency.setValueAtTime(520,t);f.frequency.exponentialRampToValueAtTime(240,t+d);f.Q.value=1.4;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+d);
 lfo.frequency.value=34;lg.gain.value=.08;lfo.connect(lg);lg.connect(g.gain);s.connect(f);f.connect(g);g.connect(sfx);s.start(t);s.stop(t+d+.05);lfo.start(t);lfo.stop(t+d);
 tone(95,.14,'sine',.28,{at:d-.04});noise(.08,'lowpass',400,1,.15,{at:d-.04});};
AU.stick=function(){if(!ok('stick',50))return;tone(R(2600,3000),.07,'sine',.13);tone(R(1500,1800),.05,'triangle',.08,{at:.015});};
AU.unstick=function(){if(!ok('unstick',50))return;tone(R(900,1100),.05,'square',.05);tone(R(2400,2800),.08,'sine',.1,{at:.02});};
AU.tray=function(){if(!ok('tray',60))return;tone(330,.06,'triangle',.16);tone(260,.07,'triangle',.12,{at:.06});};
AU.knot=function(){if(!ok('knot',40))return;tone(R(240,300),.12,'triangle',.14,{to:R(420,520)});noise(.05,'bandpass',1800,2,.06);};
AU.untangle=function(){if(!ok('untangle',80))return;tone(300,.18,'triangle',.16,{to:700});tone(900,.08,'sine',.08,{at:.1});};
AU.collect=function(){if(!ok('collect',50))return;[659,784,1047].forEach((f,i)=>tone(f,.14,'triangle',.11,{at:i*.05}));};
AU.correct=function(mult){if(!ok('correct',80))return;const up=Math.min(6,mult||0)*40;tone(784+up,.32,'sine',.16);tone(1568+up*2,.2,'sine',.05);tone(1047+up,.38,'sine',.14,{at:.09});tone(2094+up*2,.22,'sine',.04,{at:.09});};
AU.combo=function(n){if(!ok('combo',80))return;[523,659,784,1047,1319].slice(0,Math.min(5,2+n)).forEach((f,i)=>tone(f,.16,'triangle',.1,{at:i*.06}));};
AU.wrong=function(){if(!ok('wrong',120))return;tone(160,.2,'square',.07,{to:110});tone(150,.22,'sine',.18,{to:95});};
AU.crack=function(){if(!ok('crack',100))return;noise(.05,'highpass',3000,1,.25);for(let i=0;i<5;i++)tone(R(3000,6500),.05,'sine',.05,{at:i*.025});noise(.18,'highpass',6000,1,.08,{at:.05});};
AU.win=function(){if(!ok('win',500))return;[523,659,784,659,784,1047].forEach((f,i)=>{tone(f,.26,'triangle',.12,{at:i*.11});tone(f/2,.26,'sine',.06,{at:i*.11});});};
AU.lose=function(){if(!ok('lose',500))return;[392,349,294].forEach((f,i)=>tone(f,.32,'triangle',.12,{at:i*.18}));};
AU.tick=function(){if(!ok('tick',300))return;tone(1400,.03,'square',.04);};
AU.rumble=function(){if(!ok('rumble',300))return;noise(.45,'lowpass',220,1,.25,{to:90});tone(70,.4,'sine',.2,{to:45});};
AU.page=function(){if(!ok('page',60))return;noise(.09,'bandpass',R(2800,3600),.7,.08,{to:1800});};
AU.ui=function(){if(!ok('ui',40))return;tone(R(560,620),.04,'triangle',.12);noise(.02,'bandpass',2600,3,.05);};
AU.oddity=function(){if(!ok('odd',300))return;[880,1109,1319,1760].forEach((f,i)=>tone(f,.4,'sine',.07,{at:i*.09}));};
// light background music: slow plucked chords on a warm triangle, plus a soft bass
const CH=[[60,64,67,71],[57,60,64,67],[53,57,60,64],[55,59,62,67],[60,64,67,72],[52,55,59,64],[53,57,60,65],[55,59,62,65]];
const mf=n=>440*Math.pow(2,(n-69)/12);
function musTick(){if(!C||!AU.musicOn)return;const spb=60/78/2;while(musNext<C.currentTime+.4){const bar=Math.floor(musStep/8)%CH.length,i=musStep%8,ch=CH[bar];const at=musNext-C.currentTime;
  const pat=[0,2,1,3,2,1,3,2];if(i!==5)tone(mf(ch[pat[i]]+12),spb*1.8,'triangle',i===0?.05:.032,{at:Math.max(0,at),bus:mus,a:.01});
  if(i===0)tone(mf(ch[0]-12),spb*7,'sine',.07,{at:Math.max(0,at),bus:mus,a:.03});if(i===4)tone(mf(ch[2]-12),spb*3,'sine',.04,{at:Math.max(0,at),bus:mus,a:.03});
  musStep++;musNext+=spb;}}
AU.startMusic=function(){if(!C||musTimer)return;musNext=C.currentTime+.1;musTimer=setInterval(musTick,120);};
AU.stopMusic=function(){if(musTimer){clearInterval(musTimer);musTimer=null;}};
window.AU=AU;
window.HAP=function(p){try{if(window.JD&&JD.save&&JD.save.set.haptics===false)return;if(navigator.vibrate)navigator.vibrate(p);}catch(e){}};
})();
