(function(){
var $=function(i){return document.getElementById(i)};
var save={coins:0,best:0,level:1,p:{speed:1,fly:1,strong:1},outfits:[0],outfit:0};
try{var s=JSON.parse(localStorage.getItem('minnalRunner'));if(s)save=Object.assign(save,s)}catch(e){}
save.p=Object.assign({speed:1,fly:1,strong:1,zap:2},save.p);
function persist(){try{localStorage.setItem('minnalRunner',JSON.stringify(save))}catch(e){}}
var OUT=[{n:'Blue Hero',s:'#1e4fd8',c:'#e63946',price:0},{n:'Midnight',s:'#1b1b2f',c:'#ffd23f',price:150},{n:'Green Flash',s:'#12a150',c:'#f4f7ff',price:250},{n:'Royal Purple',s:'#7b2cbf',c:'#ff9e00',price:400}];
var PW={speed:{n:'⚡ Speed',d:'Faster and unstoppable for 5s',price:40,dur:5},fly:{n:'🕊 Fly',d:'Soar over traffic for 5s',price:60,dur:5},strong:{n:'💪 Strong',d:'Smash obstacles for 6s',price:50,dur:6},zap:{n:'🌩 Zap',d:'Lightning destroys all obstacles ahead',price:70,dur:0}};
var KEYS=['speed','fly','strong','zap'];
var TH=[{n:'Kerala Village',a:'#0a1a33',b:'#ff9e5e',g:'#1f8a4c',r:'#2b2f3a',o:'#e8edf5',cc:'#17613a'},{n:'Kovalam Beach',a:'#2a9df4',b:'#ffe3a3',g:'#e8c97a',r:'#5a5f6b',o:'#fff3b0',cc:'#d4b062'},{n:'Kochi Night City',a:'#050914',b:'#3b2a6b',g:'#1a1f33',r:'#15171f',o:'#dfe7ff',cc:'#0e1226',city:1},{n:'Munnar Hills',a:'#7fd1ae',b:'#f4fff0',g:'#2f9e44',r:'#4a4f45',o:'#fffbe0',cc:'#1b7a3a'},{n:'Temple Festival',a:'#3d0c4a',b:'#ff6b35',g:'#7a3b12',r:'#2a1a12',o:'#ffd23f',cc:'#4a1f10'}];
var cv=$('c'),ctx=cv.getContext('2d');ctx.scale(2,2);
var W=360,H=640,HY=190,D=100,PD=8,g=null,last=0;
function pr(d){return 1-d/D}
function sy(p){return HY+(H-HY)*p}
function lx(l,p){return W/2+(l-1)*W*0.3*p}

var AC=null,mute=false,mi=null,ms=0,NOTES=[261,294,330,392,440,523],BASS=[130,130,98,98,110,110,98,98];
function ac(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,ty,v,sl,t0){var a=ac();if(!a||mute)return;var t=a.currentTime+(t0||0),o=a.createOscillator(),gn=a.createGain();o.type=ty||'square';o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(sl,t+d);gn.gain.setValueAtTime(v||.1,t);gn.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d)}
function sfx(k){if(k==='coin'){tone(880,.08,'square',.07);tone(1320,.12,'square',.07,0,.07)}else if(k==='zap'){tone(1400,.45,'sawtooth',.12,60);tone(90,.4,'square',.1,40)}else if(k==='smash'){tone(220,.2,'square',.12,50)}else if(k==='power'){tone(300,.4,'triangle',.15,900)}else if(k==='die'){tone(400,.6,'sawtooth',.12,60)}else if(k==='level'){[523,659,784,1047].forEach(function(f,i){tone(f,.15,'triangle',.12,0,i*.1)})}}
/* ===== BGM SPACE: plays bgm.mp3 if it exists, else built-in music ===== */
var bgm=$('bgm'),bgmOK=false;bgm.volume=.6;
if(bgm.readyState>=3)bgmOK=true;
bgm.addEventListener('canplaythrough',function(){bgmOK=true});
bgm.addEventListener('error',function(){bgmOK=false});
function music(on){clearInterval(mi);mi=null;if(!on){bgm.pause();return}if(bgmOK){bgm.muted=mute;bgm.play().catch(function(){});return}if(on)mi=setInterval(function(){var n=ms++,i=n%16,bar=(n>>4)%4,sc=[220,261,294,330,392,440,523,659],mel=[5,6,5,4,3,4,5,3,5,6,7,6,5,4,3,2],bs=[110,110,87,98];if(i%4===0)tone(90,.16,'sine',.25,40);if(i===4||i===12)tone(220,.1,'square',.07,90);if(i%2===1)tone(7000,.03,'square',.012);if(i%2===0)tone(bs[bar],.22,'sawtooth',.07);tone(sc[mel[i]]*(bar===3?1.5:1),.2,'sawtooth',.035)},135)}
$('snd').addEventListener('pointerdown',function(e){e.stopPropagation();mute=!mute;bgm.muted=mute;$('snd').textContent=mute?'🔇':'🔊'});
function exitGame(){if(g)g.run=false;persist();g=null;menuStats();refreshHud();show('menu')}
$('exit').addEventListener('pointerdown',function(e){e.stopPropagation();exitGame()});
$('overMenu').onclick=exitGame;
$('quit').onclick=function(){music(false);try{window.close()}catch(e){}show('bye')};
$('back').onclick=function(){music(true);show('menu')};
document.addEventListener('pointerdown',function(){ac();if(!mi)music(true)},{once:true,capture:true});
function buildPw(){
 var h='';KEYS.forEach(function(k,i){h+='<button id="b_'+k+'" data-k="'+k+'">'+PW[k].n+' <span id="n_'+k+'"></span></button>'});
 $('pw').innerHTML=h;
 KEYS.forEach(function(k){$('b_'+k).addEventListener('pointerdown',function(e){e.stopPropagation();usePower(k)})});
}
function refreshHud(){
 $('coins').textContent='🪙 '+save.coins;
 $('lvl').textContent='Lv '+(g?g.lv:save.level);
 if(g)$('fill').style.width=Math.min(100,g.lc/g.goal*100)+'%';
 KEYS.forEach(function(k){
  $('n_'+k).textContent='×'+save.p[k];
  var b=$('b_'+k);b.disabled=!(g&&g.run)||(save.p[k]<1&&!(g&&g.pw&&g.pw.t===k));
  b.classList.toggle('on',!!(g&&g.pw&&g.pw.t===k));
 });
}
function usePower(k){
 if(!g||!g.run||save.p[k]<1)return;if(k==='zap'){save.p.zap--;persist();zap();refreshHud();return}if(g.pw)return;
 save.p[k]--;persist();
 sfx('power');g.pw={t:k,left:PW[k].dur};refreshHud();
}
function show(id){['menu','over','shop','bye'].forEach(function(x){$(x).classList.toggle('show',x===id)})}
function start(){ac();music(true);
 g={run:true,lane:1,x:1,objs:[],spd:30+save.level*2,sp:30,dist:0,t:0,lv:save.level,lc:0,goal:8+save.level*3,pw:null,msg:'',mt:0,earned:0};
 show(null);refreshHud();
}
function die(){sfx('die');
 g.run=false;
 var m=Math.floor(g.dist);if(m>save.best)save.best=m;
 persist();
 $('res').textContent='Distance '+m+' m · Coins earned '+g.earned+' · Level '+g.lv;
 show('over');refreshHud();
}
function spawn(){
 var r=Math.random(),lane=Math.floor(Math.random()*3);
 if(r<.5){for(var i=0;i<5;i++)g.objs.push({k:'coin',lane:lane,d:D+i*3.5})}
 else{
  var t=Math.random()<.5?'rick':'bar';
  g.objs.push({k:t,lane:lane,d:D});
  if(Math.random()<.35){var l2=(lane+1+Math.floor(Math.random()*2))%3;g.objs.push({k:Math.random()<.5?'rick':'bar',lane:l2,d:D})}
  if(Math.random()<.5){for(var j=0;j<3;j++)g.objs.push({k:'coin',lane:lane,d:D+8+j*3.5,air:true})}
 }
}
function update(dt){
 if(!g||!g.run)return;
 g.t+=dt;if(g.fx){g.fx.forEach(function(f){f.t-=dt});g.fx=g.fx.filter(function(f){return f.t>0})}g.fl=Math.max(0,(g.fl||0)-dt);
 var fast=g.pw&&g.pw.t==='speed';
 var sp=g.spd*(fast?1.8:1);
 g.dist+=sp*dt*0.3;
 g.x+=(g.lane-g.x)*Math.min(1,dt*12);
 if(g.pw){g.pw.left-=dt;if(g.pw.left<=0){g.pw=null;refreshHud()}}
 g.sp-=sp*dt;
 if(g.sp<=0){g.sp=24+Math.random()*14;spawn()}
 for(var i=0;i<g.objs.length;i++){
  var o=g.objs[i];o.d-=sp*dt;
  if(o.hit||o.d>PD+2||o.d<PD-2||Math.abs(g.x-o.lane)>0.55)continue;
  if(o.k==='coin'){sfx('coin');o.hit=true;save.coins++;g.earned++;g.lc++;if(g.lc>=g.goal)levelUp();refreshHud()}
  else{
   var p=g.pw&&g.pw.t;
   if(p==='fly')continue;
   if(p==='speed'||p==='strong'){o.hit=true;sfx('smash');g.msg='Smash!';g.mt=.6}
   else{die();return}
  }
 }
 g.objs=g.objs.filter(function(o){return !o.hit&&o.d>-6});
 if(g.mt>0)g.mt-=dt;
}
function zap(){var n=0;g.fx=g.fx||[];g.objs.forEach(function(o){if(o.k!=='coin'&&!o.hit&&o.d<65&&o.d>PD-1){o.hit=true;n++;g.fx.push({lane:o.lane,d:o.d,t:.4})}});g.fl=.25;g.msg=n?'ZAP! ×'+n:'ZAP!';g.mt=.8;sfx('zap')}
function levelUp(){
 sfx('level');g.lv++;save.level=g.lv;g.lc=0;g.goal=8+g.lv*3;g.spd+=2.5;
 save.coins+=20;g.earned+=20;g.msg='Level '+g.lv+' · '+TH[(g.lv-1)%TH.length].n+' +20';g.mt=1.8;persist();
}

function tree(x,y,s){
 ctx.strokeStyle='#6b4423';ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+6*s,y-40*s,x+2*s,y-80*s);ctx.stroke();
 ctx.strokeStyle='#2fa05a';ctx.lineWidth=4*s;
 for(var a=-2;a<=2;a++){ctx.beginPath();ctx.moveTo(x+2*s,y-80*s);ctx.quadraticCurveTo(x+a*18*s,y-100*s,x+a*28*s,y-72*s+Math.abs(a)*6*s);ctx.stroke()}
}
function hero(x,y,s,fly,t){s*=1.5;
 var bob=Math.sin(t*14)*3*s,oy=fly?-46*s+Math.sin(t*5)*4*s:0,o=OUT[save.outfit];
 y+=oy+bob;
 ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+(fly?-oy:0)+2*s,16*s,5*s,0,0,7);ctx.fill();
 ctx.fillStyle=o.c;ctx.beginPath();ctx.moveTo(x-9*s,y-40*s);ctx.lineTo(x+9*s,y-40*s);ctx.lineTo(x+(fly?0:Math.sin(t*10)*6*s),y+(fly?4*s:-2*s));ctx.closePath();ctx.fill();
 var leg=Math.sin(t*14)*8*s;
 ctx.strokeStyle=o.s;ctx.lineWidth=7*s;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(x-4*s,y-18*s);ctx.lineTo(x-4*s+(fly?-3*s:leg),y);ctx.moveTo(x+4*s,y-18*s);ctx.lineTo(x+4*s+(fly?3*s:-leg),y);ctx.stroke();
 ctx.fillStyle=o.s;ctx.fillRect(x-9*s,y-42*s,18*s,26*s);
 ctx.strokeStyle='#ffb52e';ctx.lineWidth=1.6*s;ctx.beginPath();ctx.arc(x,y-29*s,8*s,0,7);ctx.stroke();ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(x+2.5*s,y-35*s);ctx.lineTo(x-3.5*s,y-28.5*s);ctx.lineTo(x-0.5*s,y-28.5*s);ctx.lineTo(x-2.5*s,y-23*s);ctx.lineTo(x+3.5*s,y-30*s);ctx.lineTo(x+0.5*s,y-30*s);ctx.closePath();ctx.fill();
 ctx.fillStyle='#c68642';ctx.beginPath();ctx.arc(x,y-50*s,8*s,0,7);ctx.fill();
 ctx.fillStyle='#1a1208';ctx.beginPath();ctx.arc(x,y-54*s,8*s,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x-5*s,y-52*s,4*s,2.5*s);ctx.fillRect(x+1*s,y-52*s,4*s,2.5*s);
 ctx.strokeStyle=o.s;ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(x-9*s,y-38*s);ctx.lineTo(x-14*s,y-26*s+leg*0.4);ctx.moveTo(x+9*s,y-38*s);ctx.lineTo(x+14*s,y-26*s-leg*0.4);ctx.stroke();
}
function ent(o){
 var p=pr(o.d);if(p<=0.02)return;
 var x=lx(o.lane,p),y=sy(p),s=p*1.5;
 if(o.k==='coin'){
  var cy=y-(o.air?34:14)*s,w=Math.abs(Math.cos(g.t*5+o.d))*9*s+2*s;
  ctx.fillStyle='#ffc400';ctx.beginPath();ctx.ellipse(x,cy,w,9*s,0,0,7);ctx.fill();
  ctx.strokeStyle='#b8860b';ctx.lineWidth=1.5*s;ctx.stroke();
 }else if(o.k==='rick'){
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y+2*s,24*s,6*s,0,0,7);ctx.fill();
  ctx.fillStyle='#111';ctx.fillRect(x-22*s,y-34*s,44*s,24*s);
  ctx.fillStyle='#ffd23f';ctx.fillRect(x-22*s,y-52*s,44*s,20*s);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x-18*s,y-48*s,36*s,10*s);
  ctx.fillStyle='#333';
  ctx.beginPath();ctx.arc(x-16*s,y-8*s,7*s,0,7);ctx.arc(x+16*s,y-8*s,7*s,0,7);ctx.fill();
 }else{
  ctx.fillStyle='#fff';ctx.fillRect(x-26*s,y-34*s,52*s,18*s);
  ctx.fillStyle='#e63946';
  for(var i=0;i<4;i++)ctx.fillRect(x-26*s+i*13*s,y-34*s,6.5*s,18*s);
  ctx.fillStyle='#555';ctx.fillRect(x-24*s,y-16*s,5*s,16*s);ctx.fillRect(x+19*s,y-16*s,5*s,16*s);
 }
}
function draw(){
 var th=TH[((g?g.lv:save.level)-1)%TH.length];var sk=ctx.createLinearGradient(0,0,0,HY);sk.addColorStop(0,th.a);sk.addColorStop(1,th.b);
 ctx.fillStyle=sk;ctx.fillRect(0,0,W,HY);
 ctx.fillStyle=th.g;ctx.fillRect(0,HY,W,H-HY);
 ctx.fillStyle=th.o;ctx.beginPath();ctx.arc(300,60,th.city?14:22,0,7);ctx.fill();ctx.fillStyle=th.cc;if(th.city){for(var b=0;b<9;b++){var bh=20+(b*37)%50;ctx.fillRect(b*42+4,HY-bh,30,bh)}}else{for(var h=0;h<4;h++){ctx.beginPath();ctx.arc(h*110+20,HY+30,70,Math.PI,0);ctx.fill()}}
 ctx.fillStyle=th.r;ctx.beginPath();ctx.moveTo(W/2-W*0.19*0.02,HY);ctx.lineTo(W/2+W*0.19*0.02,HY);
 ctx.lineTo(W/2+W*0.5*1.0,H);ctx.lineTo(W/2-W*0.5*1.0,H);ctx.closePath();ctx.fill();
 var dist=g?g.dist/0.3:0;
 ctx.strokeStyle='rgba(255,255,255,.7)';
 for(var k=0;k<2;k++){
  for(var i=0;i<14;i++){
   var d1=((i*8-(dist%8))+D)%D,d2=d1+3.5;
   var p1=pr(Math.min(d1,D)),p2=pr(Math.min(d2,D));
   if(p1<=0||p2<=0)continue;
   var bx=(k===0?-0.5:0.5)+1;
   ctx.lineWidth=3*p1;ctx.beginPath();ctx.moveTo(lx(bx,p1),sy(p1));ctx.lineTo(lx(bx,p2),sy(p2));ctx.stroke();
  }
 }
 for(var t=0;t<8;t++){
  var dd=((t*14-(dist%14))+D)%D,tp=pr(dd);if(tp<=0.05)continue;
  tree(W/2-W*0.62*tp,sy(tp),tp*1.1);tree(W/2+W*0.62*tp,sy(tp),tp*1.1);
 }
 if(!g)return;
 var list=g.objs.slice().sort(function(a,b){return b.d-a.d}),heroDone=false,pp=pr(PD);
 list.forEach(function(o){
  if(!heroDone&&o.d<PD){hero(lx(g.x,pp),sy(pp),pp*1.25,g.pw&&g.pw.t==='fly',g.t);heroDone=true}
  ent(o);
 });
 if(!heroDone)hero(lx(g.x,pp),sy(pp),pp*1.25,g.pw&&g.pw.t==='fly',g.t);
 if(g.fx)g.fx.forEach(function(f){var p=pr(f.d),x=lx(f.lane,p),y=sy(p)-20*p;ctx.strokeStyle='#fff7a8';ctx.shadowColor='#ffd23f';ctx.shadowBlur=18;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+(Math.random()-.5)*20,0);for(var j=1;j<7;j++)ctx.lineTo(x+(Math.random()-.5)*40,y*j/7);ctx.lineTo(x,y);ctx.stroke();ctx.shadowBlur=0});if(g.fl>0){ctx.fillStyle='rgba(255,255,200,'+g.fl*1.5+')';ctx.fillRect(0,0,W,H)}
 if(g.pw&&g.pw.t==='speed'){ctx.strokeStyle='rgba(255,210,63,.6)';ctx.lineWidth=2;for(var q=0;q<12;q++){var xx=(q*53+g.t*900)%W,yy=(q*97+g.t*1200)%H;ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx,yy+40);ctx.stroke()}}
 if(g.mt>0){ctx.fillStyle='#ffd23f';ctx.font='700 28px Bungee,Impact,sans-serif';ctx.textAlign='center';ctx.fillText(g.msg,W/2,250)}
}
function loop(ts){
 var dt=Math.min(.05,(ts-last)/1000||0);last=ts;
 update(dt);draw();requestAnimationFrame(loop);
}

function move(dir){if(g&&g.run)g.lane=Math.max(0,Math.min(2,g.lane+dir))}
document.addEventListener('keydown',function(e){
 if(e.key==='ArrowLeft'||e.key==='a')move(-1);
 else if(e.key==='ArrowRight'||e.key==='d')move(1);
 else if(e.key>='1'&&e.key<='4')usePower(KEYS[+e.key-1]);
});
var sx=null;
$('stage').addEventListener('pointerdown',function(e){sx=e.clientX});
$('stage').addEventListener('pointerup',function(e){
 if(sx===null)return;var dx=e.clientX-sx;sx=null;
 if(Math.abs(dx)>25)move(dx>0?1:-1);
 else{var r=$('stage').getBoundingClientRect();if(e.clientY<r.top+r.height*.8)move(e.clientX<r.left+r.width/2?-1:1)}
});

function renderShop(){
 $('shopCoins').textContent='You have 🪙 '+save.coins;
 var h='';
 KEYS.forEach(function(k){
  h+='<div class="row"><div><b>'+PW[k].n+' (owned '+save.p[k]+')</b><small>'+PW[k].d+'</small></div><button data-buy="'+k+'"'+(save.coins<PW[k].price?' disabled':'')+'>🪙 '+PW[k].price+'</button></div>';
 });
 OUT.forEach(function(o,i){
  var own=save.outfits.indexOf(i)>-1,eq=save.outfit===i;
  h+='<div class="row"><div><b><span class="sw" style="background:'+o.s+'"></span>'+o.n+'</b><small>'+(eq?'Wearing':own?'Owned':'Outfit')+'</small></div>'+
   (eq?'<button disabled>Equipped</button>':own?'<button data-eq="'+i+'">Wear</button>':'<button data-out="'+i+'"'+(save.coins<o.price?' disabled':'')+'>🪙 '+o.price+'</button>')+'</div>';
 });
 $('shopList').innerHTML=h;
}
$('shopList').addEventListener('click',function(e){
 var b=e.target.closest('button');if(!b||b.disabled)return;
 var d=b.dataset;
 if(d.buy){var c=PW[d.buy].price;if(save.coins>=c){save.coins-=c;save.p[d.buy]++}}
 else if(d.out){var o=OUT[+d.out];if(save.coins>=o.price){save.coins-=o.price;save.outfits.push(+d.out);save.outfit=+d.out}}
 else if(d.eq){save.outfit=+d.eq}
 persist();renderShop();refreshHud();
});
var from='menu';
function openShop(f){from=f;renderShop();show('shop')}
function menuStats(){$('stats').textContent='Level '+save.level+' · Best '+save.best+' m · 🪙 '+save.coins}
$('play').onclick=start;$('again').onclick=start;
$('openShop').onclick=function(){openShop('menu')};
$('overShop').onclick=function(){openShop('over')};
$('closeShop').onclick=function(){menuStats();g=from==='over'?g:null;refreshHud();show(from)};
buildPw();menuStats();refreshHud();requestAnimationFrame(loop);
})();
