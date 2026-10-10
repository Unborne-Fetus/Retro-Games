'use strict';
// Original pixel sprites and mechanics inspired by fixed-screen 1980s alien shooters.
// No commercial sprites, sounds, or ROM assets are included.
const G_PIX={
fighter:["....ww....","...wccw...","...wccw...","r..wccw..r","rrwwccwwrr","rrwwccwwrr",".rrwwwwrr.","...wbbw...","...b..b..."],
bee:[".y......y.","yy.y..y.yy",".yyyyyyyy.","..ycyycy..","..yyyyyy..",".y.yyyy.y.","y..y..y..y"],
butter:["p........p","pp.p..p.pp",".pppppppp.","..pwwwwp..","...pwwp...","..pppppp..",".p..pp..p.","p...pp...p"],
boss:["r..r..r..r",".rrrrrrrr.","rrrbbbbrrr","rrbybbybrr","rrrrrrrrrr",".rrrwwrrr.","..r.rr.r..","..r....r.."],
bossBlue:["c..c..c..c",".cccccccc.","cccbbbbccc","ccbybbybcc","cccccccccc",".cccwwccc.","..c.cc.c..","..c....c.."]
};
const G_COL={w:'#f8f5ed',c:'#4ad8ef',r:'#f35a73',b:'#2145c1',y:'#f4d855',p:'#b879f9'};
function gSprite(name,x,y,scale=2,flip=false){const lines=G_PIX[name];const w=lines[0].length;for(let row=0;row<lines.length;row++)for(let col=0;col<w;col++){const v=lines[row][flip?w-1-col:col];if(v!=='.')rect(Math.round(x+(col-w/2)*scale),Math.round(y+(row-lines.length/2)*scale),scale,scale,G_COL[v])}}
function galagaInit(g){g.wave=1;g.score=0;g.lives=3;g.playerX=350;g.playerY=440;g.dual=false;g.cool=0;g.invincible=2000;g.aliens=[];g.bullets=[];g.enemyBullets=[];g.effects=[];g.hits=0;g.shotsFired=0;g.formationT=0;g.diveClock=2400;g.captureClock=7000;g.beam=null;g.captured=false;g.captor=null;g.stageTime=0;g.stageIntro=1600;g.challenge=false;g.combo=0;g.high=0;g.music=0;g.powerups=[];g.shield=0;g.rapid=0;g.starfield=Array.from({length:85},()=>({x:Math.random()*700,y:Math.random()*500,v:.1+Math.random()*.6,r:Math.random()<.8?1:2}));try{g.high=Number(localStorage.getItem('retro-galaga-hi')||0)}catch{}galagaWave(g)}
function galagaWave(g){g.aliens=[];g.challenge=g.wave%4===3;g.stageIntro=1750;g.stageTime=0;g.diveClock=2100;g.captureClock=5200;g.formationT=0;g.beam=null;g.captured=false;
const rows=g.challenge?3:5,cols=g.challenge?8:10;
for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
const type=row===0?'boss':row<=2?'butter':'bee';let a={id:g.wave+'-'+row+'-'+col,type,row,col,baseX:350+(col-(cols-1)/2)*49,baseY:76+row*37,x:350+(col-(cols-1)/2)*49,y:-100-row*45-col*9,phase:'enter',age:-(row*95+col*45),hp:type==='boss'&&!g.challenge?2:1,rot:0,dive:0,shot:false,escape:false};g.aliens.push(a)}
}
function galagaHit(g){if(g.invincible>0||g.over)return;if(g.shield>0){g.shield=0;g.invincible=850;g.effects.push({x:g.playerX,y:g.playerY,age:0,color:'#51f5ea'});return;}g.lives--;g.effects.push({x:g.playerX,y:g.playerY,age:0,color:'#f9d568'});g.invincible=2300;g.dual=false;if(g.lives<=0){g.over=true;galagaRecord(g)}}
function galagaRecord(g){if(g.score>g.high){g.high=g.score;try{localStorage.setItem('retro-galaga-hi',String(g.high))}catch{}}}
function galagaFireEnemy(g,a){g.enemyBullets.push({x:a.x,y:a.y+12,vx:(g.playerX-a.x)/125,vy:2.7+g.wave*.13})}
function galagaUpdate(g,dt){const s=dt/16.667;g.stageTime+=dt;g.formationT+=dt;g.invincible=Math.max(0,g.invincible-dt);g.shield=Math.max(0,g.shield-dt);g.rapid=Math.max(0,g.rapid-dt);g.cool-=dt;g.diveClock-=dt;g.captureClock-=dt;g.stageIntro=Math.max(0,g.stageIntro-dt);
g.playerX=Math.max(g.dual?43:25,Math.min(g.dual?657:675,pointerX!==null?pointerX:g.playerX+(held('ArrowRight','d','D')?5.1*s:0)-(held('ArrowLeft','a','A')?5.1*s:0)));
if(held('Space')&&g.cool<=0){const xs=g.dual?[-16,16]:[0];for(const off of xs){g.bullets.push({x:g.playerX+off,y:g.playerY-19,vy:-10});g.shotsFired++}g.cool=g.rapid?75:(g.dual?185:165)}
for(const st of g.starfield){st.y+=st.v*s;if(st.y>500)st.y=0}
for(const b of g.bullets)b.y+=b.vy*s;
for(const b of g.enemyBullets){b.x+=b.vx*s;b.y+=b.vy*s;if(Math.abs(b.x-g.playerX)<(g.dual?36:15)&&Math.abs(b.y-g.playerY)<17){b.dead=true;galagaHit(g)}}
for(const p of g.powerups){p.y+=1.75*s;if(Math.abs(p.x-g.playerX)<28&&Math.abs(p.y-g.playerY)<24){p.dead=true;if(p.kind==='shield')g.shield=11000;else g.rapid=11000;g.score+=200}}g.powerups=g.powerups.filter(p=>!p.dead&&p.y<500);
g.bullets=g.bullets.filter(b=>b.y>-20&&!b.dead);g.enemyBullets=g.enemyBullets.filter(b=>b.y<515&&!b.dead);
const living=g.aliens.filter(a=>!a.dead);
if(!g.challenge&&g.stageIntro===0&&g.diveClock<=0&&living.length){const available=living.filter(a=>a.phase==='form');if(available.length){const a=available[Math.floor(Math.random()*available.length)];a.phase='dive';a.dive=0;a.originX=a.x;a.originY=a.y;a.attackX=g.playerX;a.shot=false}g.diveClock=Math.max(630,2400-g.wave*160)}
if(!g.challenge&&g.stageIntro===0&&g.captureClock<=0&&!g.dual&&!g.captured){const bosses=living.filter(a=>a.type==='boss'&&a.phase==='form');if(bosses.length){const a=bosses[Math.floor(Math.random()*bosses.length)];a.phase='tractor';a.dive=0;a.originX=a.x;a.originY=a.y;g.captor=a.id}g.captureClock=12500}
for(const a of living){a.age+=dt;const sway=Math.sin(g.formationT*.0012)*14;
if(a.phase==='enter'){if(a.age>=0){a.y+=(a.baseY-a.y)*Math.min(.12*s,.3);a.x+=(a.baseX+sway-a.x)*Math.min(.09*s,.28);if(Math.abs(a.y-a.baseY)<3){a.phase='form';a.y=a.baseY}}}
else if(a.phase==='form'){a.x=a.baseX+sway;a.y=a.baseY+Math.sin(g.formationT*.002+a.col*.3)*3}
else if(a.phase==='dive'){a.dive+=dt*.001;a.x=a.originX+Math.sin(a.dive*3.5)*115+Math.sin(a.dive*1.2)*(a.attackX-a.originX)*.5;a.y=a.originY+Math.sin(Math.min(a.dive,3)*.63)*620;a.rot=Math.sin(a.dive*3.5);if(a.dive>3.2||a.y>515){if(g.challenge){a.dead=true;a.escape=true}else{a.phase='enter';a.y=-48;a.age=0;a.rot=0}}if(!a.shot&&a.dive>1.2&&Math.random()<.08*s){galagaFireEnemy(g,a);a.shot=true}}
else if(a.phase==='tractor'){a.dive+=dt*.001;a.x=a.originX+Math.sin(a.dive*3)*70;a.y=a.originY+Math.sin(Math.min(1,a.dive/1.1)*Math.PI/2)*154;if(a.dive>=1.1){a.phase='beam';g.beam={id:a.id,clock:0}}}
else if(a.phase==='beam'){a.x+=((g.playerX)-a.x)*.005*s;g.beam={id:a.id,clock:(g.beam?.clock||0)+dt};if(g.beam.clock>3400){a.phase='return';g.beam=null}}
else if(a.phase==='return'){a.y-=3*s;if(a.y<=a.baseY){a.phase='form';a.y=a.baseY}}
if(a.phase==='beam'&&Math.abs(g.playerX-a.x)<24&&g.beam?.clock>850&&!g.captured&&!g.dual){g.captured=true;g.beam=null;a.carry=true;a.phase='return';g.lives--;g.invincible=2300;if(g.lives<=0){g.over=true;galagaRecord(g)}g.effects.push({x:g.playerX,y:g.playerY,age:0,color:'#5ed8fc'});g.playerX=350;setTimeoutGalaga(g)}
if(a.dead)continue;
for(const b of g.bullets){if(b.dead)continue;if(Math.abs(b.x-a.x)<19&&Math.abs(b.y-a.y)<17){b.dead=true;g.hits++;a.hp--;g.effects.push({x:a.x,y:a.y,age:0,color:a.type==='boss'?'#74e6ff':'#f3a44e'});if(a.hp<=0){a.dead=true;g.score+=(a.type==='boss'?150:a.type==='butter'?80:50)*(a.phase==='dive'?2:1);if(a.carry){g.dual=true;g.captured=false;g.score+=500;g.effects.push({x:a.x,y:a.y,age:0,color:'#f4e474'})}if(a.type==='boss'&&Math.random()<.32)g.powerups.push({x:a.x,y:a.y,kind:Math.random()<.5?'shield':'rapid'});g.combo++}else if(a.type==='boss')a.damaged=true}}
if(!a.dead&&g.invincible<=0&&Math.abs(a.x-g.playerX)<23&&Math.abs(a.y-g.playerY)<23){a.dead=true;galagaHit(g)}}
if(g.captured&&g.captureRelease<=g.stageTime){g.captured=false}
g.effects=g.effects.filter(e=>e.age<430);for(const e of g.effects)e.age+=dt;
if(g.challenge&&g.stageIntro===0){for(const a of living)if(a.phase==='form'&&a.age>400){a.phase='dive';a.dive=0;a.originX=a.x;a.originY=a.y;a.attackX=g.playerX}}
if(!g.aliens.some(a=>!a.dead)&&g.stageIntro===0){if(g.challenge)g.score+=g.aliens.filter(a=>!a.escape).length===g.aliens.length?3000:1000;g.wave++;galagaRecord(g);galagaWave(g)}
g.bullets=g.bullets.filter(b=>!b.dead);
galagaDraw(g)}
function setTimeoutGalaga(g){g.captureRelease=g.stageTime+3200}
function galagaDraw(g){rect(0,0,700,500,'#030510');for(const st of g.starfield)rect(st.x,st.y,st.r,st.r,st.r===2?'#577ba3':'#263958');rect(0,0,700,40,'#090d23');rect(0,472,700,28,'#090d23');
text('1UP',75,19,16,'#f06675');text(String(g.score).padStart(6,'0'),75,36,18,'#ffffff');text('HIGH SCORE',350,19,16,'#f06675');text(String(Math.max(g.score,g.high)).padStart(6,'0'),350,36,18,'#ffffff');text('STAGE '+g.wave,623,23,17,'#e6eaf5');
for(let i=0;i<Math.max(0,g.lives-1);i++)gSprite('fighter',30+i*25,487,.85);
if(g.invincible<=0||Math.floor(g.time/110)%2===0){if(g.dual){for(const offset of [-16,16])gSprite('fighter',g.playerX+offset,g.playerY,2.2)}else gSprite('fighter',g.playerX,g.playerY,2.2)}
for(const a of g.aliens){if(a.dead)continue;const sprite=a.type==='boss'?(a.damaged?'bossBlue':'boss'):a.type==='butter'?'butter':'bee';gSprite(sprite,a.x,a.y,2.5)}
if(g.beam){const a=g.aliens.find(a=>a.id===g.beam.id);if(a){ctx.save();ctx.fillStyle='rgba(78,230,246,.15)';ctx.beginPath();ctx.moveTo(a.x-18,a.y+10);ctx.lineTo(a.x+63,460);ctx.lineTo(a.x-63,460);ctx.closePath();ctx.fill();ctx.restore();for(let i=0;i<8;i++)rect(a.x-35+i*10,Math.floor(240+Math.sin(g.time*.005+i)*80),3,7,'#74f5fd')}}
for(const b of g.bullets)rect(b.x-2,b.y,4,13,'#f6ed9c');for(const b of g.enemyBullets)rect(b.x-3,b.y,6,10,'#fca1bf');
for(const e of g.effects){const p=e.age/430;for(let j=0;j<9;j++){const a=j*Math.PI*2/9;rect(e.x+Math.cos(a)*p*35,e.y+Math.sin(a)*p*35,4,4,e.color)}}
if(g.stageIntro>0){const title=g.challenge?'CHALLENGING STAGE':'STAGE '+g.wave;text(title,350,254,30,'#6ae3fb');if(g.challenge)text('PERFECT CLEAR BONUS',350,283,15,'#ffe88b')}
for(const p of g.powerups){circ(p.x,p.y,12,p.kind==='shield'?'#51f5ea':'#ffde76');text(p.kind==='shield'?'S':'R',p.x,p.y+5,16,'#0b1531')}if(g.shield>0){ctx.strokeStyle='#51f5ea';ctx.lineWidth=2;ctx.beginPath();ctx.arc(g.playerX,g.playerY,30,0,Math.PI*2);ctx.stroke()}if(g.rapid>0)text('RAPID FIRE',350,457,14,'#ffe06b');if(g.captured)text('RESCUE YOUR FIGHTER!',350,330,21,'#ff6f9c');if(g.dual)text('DUAL FIGHTER',350,455,14,'#ffe76e');
text('HIT RATE '+(g.shotsFired?Math.floor(g.hits/g.shotsFired*100):0)+'%',598,489,12,'#9baecd')}
