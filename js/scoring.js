// Scoring: base + speed + hidden + clean + combo, times a streak multiplier. Wrong picks cost a little.
(function(){
const SC={};
SC.reset=function(){SC.score=0;SC.streak=0;SC.best=0;SC.finds=0;SC.mistakes=0;SC.breaks=0;SC.hiddenFinds=0;SC.log=[];};
SC.mult=()=>1+.25*Math.min(SC.streak,8);
// t: seconds taken; vis: visibility of the target when asked (0..1); clean: no mistakes on this request; n: items in request
SC.find=function(t,vis,clean,n){const b={base:100,speed:Math.max(0,Math.round(120-t*9)),hidden:vis<.4?(vis<.08?120:60):0,clean:clean?40:0,combo:(n-1)*90};
 const m=SC.mult();const sub=b.base+b.speed+b.hidden+b.clean+b.combo;b.mult=m;b.total=Math.round(sub*m/5)*5;
 SC.score+=b.total;SC.finds++;SC.streak++;SC.best=Math.max(SC.best,SC.streak);if(b.hidden)SC.hiddenFinds++;SC.log.push(b);return b;};
SC.wrong=function(){const p=Math.min(SC.score,30);SC.score-=p;SC.streak=0;SC.mistakes++;return p;};
SC.broke=function(){const p=Math.min(SC.score,50);SC.score-=p;SC.streak=0;SC.breaks++;return p;};
SC.bonus=function(pts){SC.score+=pts;return pts;};
SC.reset();
window.SC=SC;
})();
