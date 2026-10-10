'use strict';
// Focused gameplay upgrades for the first 37 additional arcade entries.
// Original geometric/pixel artwork, independent mini-game logic and mechanics.
const P_THEME=[
{a:'#79e2fd',b:'#304de0',c:'#ffdf74',bg:'#071728'},
{a:'#ff87bb',b:'#9c4cea',c:'#ffe38a',bg:'#1d102d'},
{a:'#a5fa79',b:'#16a77d',c:'#ff9a76',bg:'#0c2122'},
{a:'#ffd07e',b:'#db6d54',c:'#88dfff',bg:'#27162c'},
{a:'#cdb2ff',b:'#6862da',c:'#ff81af',bg:'#121431'},
{a:'#60eace',b:'#3c7ecb',c:'#ffe96d',bg:'#081d33'}];
function pCircle(x,y,r,c){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function pBar(x,y,w,h,c){rect(Math.floor(x),Math.floor(y),Math.ceil(w),Math.ceil(h),c)}
function pText(v,x,y,size,c){text(v,x,y,size,c)}
function pHit(x,y,x2,y2,range){return Math.hypot(x-x2,y-y2)<range}
function pKey(g,k){if(g.keyCD>0)return false;g.keyCD=125;return k}
function pInit(g){const mode=arcadeModes[g.type]?.mode;if(!mode)return;g.mode=mode;g.variant=arcadeModes[g.type].variant;g.palette=P_THEME[g.variant];g.lives=3;g.score=0;g.stage=1;g.elapsed=0;g.keyCD=0;g.particles=[];g.special=0;
if(mode==='jumper'){g.hero={x:350,y:408,vy:-10,vx:0};g.platforms=[{x:280,y:462,w:142,kind:0}];for(let n=1;n<13;n++)g.platforms.push(pPlatform(460-n*73,g.variant));g.coins=Array.from({length:8},(_,n)=>({x:Math.random()*600+40,y:350-n*135,got:false}));g.highest=0;g.spring=0}
if(mode==='crosser'){g.hero={col:7,row:10};g.step=0;g.rows=[];for(let r=1;r<=9;r++){const water=g.variant===2&&(r===3||r===4||r===5);g.rows.push({r,water,v:(r%2?-1:1)*(1.2+(r%4)*.43),cars:Array.from({length:water?3:4},(_,i)=>({x:(i*197+r*71)%760-50,w:water?128:50+r%3*19}))})}g.coins=Array.from({length:4},()=>({col:Math.floor(Math.random()*14),row:1+Math.floor(Math.random()*9),got:false}));g.shield=0}
if(mode==='runner'){g.hero={lane:1,y:410,vy:0,z:0};g.spawn=430;g.blocks=[];g.coins=[];g.speed=3.5;g.shield=0;g.slide=0;g.distance=0;g.step=0}
if(mode==='paddle'){g.paddle={x:295,w:110};g.balls=[{x:350,y:375,vx:3.6,vy:-4.8}];g.bricks=[];pLevel(g);g.power=[];g.wide=0;g.laser=0;g.laserCD=0;g.shots=[]}
if(mode==='shooter'){g.hero={x:350,y:432};g.bullets=[];g.foes=[];g.enemyBullets=[];g.power=[];g.spawn=450;g.cool=0;g.rapid=0;g.shield=0;g.boss=null;g.bossSpawned=false}
if(mode==='catcher'){g.hero={x:350};g.fruit=[];g.spawn=350;g.combo=0;g.lastSlice=null;g.trail=[];g.invincible=0;g.laser=0}
if(mode==='platform'){g.hero={x:52,y:422,vx:0,vy:0};g.bars=[];g.ladders=[];g.barrels=[];g.spawn=1200;g.goal={x:600,y:70};g.hammers=0;for(let n=0;n<5;n++){g.bars.push({y:445-n*84,dir:n%2?-1:1});if(n<4)g.ladders.push({x:n%2?105:583,y:445-n*84})}}
}
function pPlatform(y,v){return {x:45+Math.random()*570,y,w:84+Math.random()*37,kind:Math.random()<.16?1:Math.random()<.24?2:0,phase:Math.random()*6.28,decay:0}}
function pLevel(g){g.bricks=[];const color=[3,2,1,0,4,5];for(let row=0;row<6;row++)for(let col=0;col<10;col++){g.bricks.push({x:34+col*64,y:62+row*27,w:57,h:20,hp:row<1+Math.floor(g.stage/3)?2:1,color:color[(row+g.variant)%6]})}}
function pExplode(g,x,y,c,count=9){for(let i=0;i<count;i++)g.particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7,age:0,c})}
function pLost(g){g.lives--;if(g.lives<=0)g.over=true}
function pUpdate(g,dt){const s=dt/16.667,m=g.mode,theme=g.palette;g.elapsed+=dt;g.keyCD-=dt;g.special=Math.max(0,g.special-dt);
for(const p of g.particles){p.x+=p.vx*s;p.y+=p.vy*s;p.age+=dt;p.vy+=.04*s}g.particles=g.particles.filter(p=>p.age<550);
if(m==='jumper'){const h=g.hero,dir=(held('ArrowLeft','a','A')?-1:0)+(held('ArrowRight','d','D')?1:0);h.vx=dir*5.1;h.x=(h.x+h.vx*s+700)%700;const old=h.y;h.vy+=.33*s;h.y+=h.vy*s;for(const p of g.platforms){if(p.kind===1)p.x+=Math.sin(g.elapsed*.002+p.phase)*.65*s;if(p.decay>0)p.decay+=dt;
if(h.vy>0&&old+18<=p.y&&h.y+18>=p.y&&h.x+16>p.x&&h.x-16<p.x+p.w&&p.decay<500){h.y=p.y-18;h.vy=-10.7-(p.kind===2?4:0);if(p.kind===1)p.decay=0;if(p.kind===0&&g.variant===3)h.vy-=1;g.score+=5;if(p.kind===2)pExplode(g,h.x,p.y,theme.c,14)}}
g.platforms=g.platforms.filter(p=>p.decay<500);
for(const coin of g.coins)if(!coin.got&&pHit(h.x,h.y,coin.x,coin.y,27)){coin.got=true;g.score+=100;pExplode(g,coin.x,coin.y,theme.c)}
if(h.y<195){const diff=195-h.y;h.y=195;g.highest+=diff;g.score=Math.max(g.score,Math.floor(g.highest/5));for(const p of g.platforms)p.y+=diff;for(const c of g.coins)c.y+=diff}
g.platforms=g.platforms.filter(p=>p.y<500);while(g.platforms.length<15){const top=Math.min(...g.platforms.map(p=>p.y));g.platforms.push(pPlatform(top-72,g.variant))}
g.coins=g.coins.filter(c=>c.y<520);if(g.coins.length<8)g.coins.push({x:60+Math.random()*580,y:-25,got:false});if(h.y>525)g.over=true}
if(m==='crosser'){const h=g.hero;if(g.keyCD<=0){const dx=held('ArrowLeft','a','A')?-1:held('ArrowRight','d','D')?1:0,dy=held('ArrowUp','w','W')?-1:held('ArrowDown','s','S')?1:0;if(dx||dy){h.col=Math.max(0,Math.min(13,h.col+dx));h.row=Math.max(0,Math.min(10,h.row+dy));g.keyCD=145}}
for(const row of g.rows){for(const c of row.cars){c.x+=row.v*s;if(c.x>770)c.x=-c.w;if(c.x<-c.w)c.x=770}if(h.row!==row.r)continue;
const x=30+h.col*49;const hit=row.cars.some(c=>x>c.x-15&&x<c.x+c.w+15);if(row.water){if(!hit){pLost(g);h.col=7;h.row=10}else if(g.variant===2){h.col=Math.max(0,Math.min(13,Math.round((x+row.v*s-30)/49)))}}else if(hit&&g.shield<=0){pLost(g);h.col=7;h.row=10;g.shield=900} }
g.shield=Math.max(0,g.shield-dt);
for(const c of g.coins)if(!c.got&&c.row===h.row&&c.col===h.col){c.got=true;g.score+=35}
if(h.row===0){g.score+=150;g.stage++;h.row=10;h.col=7;for(const c of g.coins){c.got=false;c.col=Math.floor(Math.random()*14);c.row=1+Math.floor(Math.random()*9)}}}
if(m==='runner'){const h=g.hero;g.step-=dt;if(g.step<=0){if(held('ArrowLeft','a','A')&&h.lane>0){h.lane--;g.step=140}else if(held('ArrowRight','d','D')&&h.lane<2){h.lane++;g.step=140}}
if(held('ArrowUp','Space','w','W')&&h.z===0)h.vy=11;if(h.vy!==0||h.z>0){h.z+=h.vy*s;h.vy-=.65*s;if(h.z<=0){h.z=0;h.vy=0}}g.slide=held('ArrowDown','s','S')&&h.z===0?1:0;
g.speed=Math.min(9,3.4+g.distance/230);g.distance+=dt*.029;g.score=Math.floor(g.distance);g.spawn-=dt;
if(g.spawn<=0){g.spawn=Math.max(250,970-g.distance*1.2);const lane=Math.floor(Math.random()*3),kind=Math.random()<.18?'coin':Math.random()<.23?'high':'block';g.blocks.push({lane,y:-40,kind,done:false})}
for(const ob of g.blocks){ob.y+=g.speed*s;if(ob.y>510)ob.done=true;if(Math.abs(ob.y-405)<25&&ob.lane===h.lane&&!ob.hit){ob.hit=true;if(ob.kind==='coin'){g.score+=50;pExplode(g,210+h.lane*140,405,theme.c)}else if((ob.kind==='high'&&!g.slide)||(ob.kind==='block'&&h.z<36)){if(g.shield>0)g.shield=0;else pLost(g)}}}
g.blocks=g.blocks.filter(b=>!b.done);g.shield=Math.max(0,g.shield-dt)}
if(m==='paddle'){g.wide=Math.max(0,g.wide-dt);g.laser=Math.max(0,g.laser-dt);g.laserCD-=dt;const p=g.paddle;p.w=g.wide>0?160:110;const speed=7*s;const dx=(held('ArrowRight','d','D')?1:0)-(held('ArrowLeft','a','A')?1:0);p.x=Math.max(8,Math.min(692-p.w,pointerX!==null?pointerX-p.w/2:p.x+speed*dx));
for(const b of g.balls){const oldY=b.y;b.x+=b.vx*s;b.y+=b.vy*s;if(b.x<9||b.x>691){b.vx*=-1;b.x=Math.max(9,Math.min(691,b.x))}if(b.y<44){b.vy=Math.abs(b.vy)}if(b.y>=447&&oldY<462&&b.x>p.x-8&&b.x<p.x+p.w+8&&b.vy>0){b.vy=-Math.abs(b.vy);b.vx=(b.x-p.x-p.w/2)/12}if(b.y>515)b.dead=true;
for(const brick of g.bricks){if(brick.hp<=0)continue;if(b.x>=brick.x-8&&b.x<=brick.x+brick.w+8&&b.y>=brick.y-8&&b.y<=brick.y+brick.h+8){brick.hp--;b.vy*=-1;g.score+=brick.hp===0?20:5;if(brick.hp===0&&Math.random()<.12)g.power.push({x:brick.x+26,y:brick.y,kind:Math.floor(Math.random()*3)});pExplode(g,b.x,b.y,theme.c,4);break}}}
g.balls=g.balls.filter(b=>!b.dead);if(!g.balls.length){pLost(g);g.balls.push({x:350,y:360,vx:4,vy:-4.5})}
for(const q of g.power){q.y+=2*s;if(q.y>447&&q.y<475&&q.x>p.x&&q.x<p.x+p.w){q.dead=true;if(q.kind===0)g.wide=11000;else if(q.kind===1){g.balls.push(...g.balls.slice(0,2).map(b=>({x:b.x,y:b.y,vx:-b.vx+1,vy:b.vy}))) }else g.laser=9000}}g.power=g.power.filter(q=>!q.dead&&q.y<510);
if(g.laser>0&&held('Space')&&g.laserCD<=0){g.shots.push({x:p.x+15,y:444},{x:p.x+p.w-15,y:444});g.laserCD=330}for(const q of g.shots){q.y-=9*s;for(const b of g.bricks)if(b.hp>0&&q.x>=b.x&&q.x<=b.x+b.w&&q.y>=b.y&&q.y<=b.y+b.h){b.hp--;q.dead=true;g.score+=20}}g.shots=g.shots.filter(q=>!q.dead&&q.y>-10);if(g.bricks.every(b=>b.hp<=0)){g.stage++;pLevel(g);g.score+=250}}
if(m==='shooter'){const h=g.hero;h.x=RC(pointerX!==null?pointerX:h.x+((held('ArrowRight','d','D')?1:0)-(held('ArrowLeft','a','A')?1:0))*5*s,22,678);h.y=RC(h.y+((held('ArrowDown','s','S')?1:0)-(held('ArrowUp','w','W')?1:0))*5*s,68,464);g.cool-=dt;g.spawn-=dt;g.rapid=Math.max(0,g.rapid-dt);g.shield=Math.max(0,g.shield-dt);if(held('Space')&&g.cool<=0){g.bullets.push({x:h.x,y:h.y-18,vy:-10});if(g.rapid>0){g.bullets.push({x:h.x-12,y:h.y-9,vy:-9,vx:-1.4},{x:h.x+12,y:h.y-9,vy:-9,vx:1.4})}g.cool=g.rapid>0?95:180}
if(g.spawn<=0){const type=Math.random()<.15?'armor':Math.random()<.22?'zig':'grunt';g.foes.push({x:RG(38,660),y:-25,dx:RG(-1,1),v:RG(1.3,2.3)+g.stage*.22,hp:type==='armor'?3:1,type,fire:RG(900,2400)});g.spawn=Math.max(230,750-g.stage*38)}
for(const b of g.bullets){b.x+=(b.vx||0)*s;b.y+=b.vy*s}for(const e of g.foes){e.y+=e.v*s;e.x+=e.type==='zig'?Math.sin(e.y*.06)*2*s:e.dx*.55*s;e.fire-=dt;if(e.fire<=0){g.enemyBullets.push({x:e.x,y:e.y,vy:3.1});e.fire=RG(1300,2400)}if(e.y>510){e.dead=true;pLost(g)}if(pHit(e.x,e.y,h.x,h.y,23)&&g.shield<=0){e.dead=true;pLost(g);g.shield=1200}for(const b of g.bullets)if(!b.dead&&pHit(b.x,b.y,e.x,e.y,21)){b.dead=true;e.hp--;if(e.hp<=0){e.dead=true;g.score+=e.type==='armor'?80:30;pExplode(g,e.x,e.y,theme.c);if(Math.random()<.08)g.power.push({x:e.x,y:e.y,kind:Math.random()<.5?'rapid':'shield'})}}}
for(const b of g.enemyBullets){b.y+=b.vy*s;if(pHit(b.x,b.y,h.x,h.y,17)&&g.shield<=0){b.dead=true;pLost(g);g.shield=1200}}
for(const q of g.power){q.y+=2*s;if(pHit(q.x,q.y,h.x,h.y,25)){q.dead=true;g[q.kind]=9000}}g.power=g.power.filter(q=>!q.dead&&q.y<500);g.bullets=g.bullets.filter(b=>!b.dead&&b.y>-20);g.foes=g.foes.filter(e=>!e.dead);g.enemyBullets=g.enemyBullets.filter(b=>!b.dead&&b.y<510);if(g.score>=g.stage*750){g.stage++;g.lives=Math.min(5,g.lives+1)}}
if(m==='catcher'){const h=g.hero;h.x=RC(pointerX!==null?pointerX:h.x+((held('ArrowRight','d','D')?1:0)-(held('ArrowLeft','a','A')?1:0))*7*s,40,660);g.spawn-=dt;g.invincible=Math.max(0,g.invincible-dt);
if(g.spawn<=0){g.fruit.push({x:RG(45,655),y:g.variant===0?505:-25,vx:g.variant===0?RG(-2.2,2.2):0,vy:g.variant===0?-RG(9,13):RG(2.1,4),bad:Math.random()<.22,r:16+Math.random()*6,hit:false});g.spawn=RG(280,560)}
for(const a of g.fruit){a.x+=a.vx*s;a.y+=a.vy*s;if(g.variant===0)a.vy+=.24*s;
if(g.variant!==0&&a.y>438&&a.y<473&&Math.abs(a.x-h.x)<48){a.hit=true;if(a.bad){if(g.invincible<=0){pLost(g);g.invincible=850}}else{g.score+=10;g.combo++}pExplode(g,a.x,a.y,a.bad?'#f98aa5':theme.c)}
if((g.variant===0&&a.y>530)||(g.variant!==0&&a.y>520)){a.hit=true;if(!a.bad){g.combo=0;pLost(g)}}}g.fruit=g.fruit.filter(a=>!a.hit)}
if(m==='platform'){const h=g.hero;const speed=3.9*s;h.x=RC(h.x+((held('ArrowRight','d','D')?1:0)-(held('ArrowLeft','a','A')?1:0))*speed,17,680);
const floor=RC(Math.round((445-h.y)/84),0,4);if(held('ArrowUp','w','W'))for(const lad of g.ladders)if(Math.abs(h.x-lad.x)<25&&Math.abs(h.y-lad.y)<80){h.y-=3.3*s;h.vy=0}
if(held('Space')&&Math.abs(h.vy)<.01)h.vy=-10.5;
const old=h.y;h.vy+=.44*s;h.y+=h.vy*s;for(const bar of g.bars){if(old<=bar.y-22&&h.y>=bar.y-22&&h.vy>=0){h.y=bar.y-22;h.vy=0}}g.spawn-=dt;if(g.spawn<=0){g.barrels.push({x:570,y:84,vx:-1.5,level:4});g.spawn=1250}
for(const barrel of g.barrels){barrel.x+=barrel.vx*s;barrel.y=445-barrel.level*84-13;if(barrel.x<17||barrel.x>680){barrel.level--;barrel.vx*=-1;if(barrel.level<0)barrel.dead=true}
if(pHit(h.x,h.y,barrel.x,barrel.y,24)){barrel.dead=true;pLost(g);h.x=50;h.y=423;h.vy=0}}
g.barrels=g.barrels.filter(b=>!b.dead);if(g.lives<=0)g.over=true;if(h.y<100&&h.x>520){g.score+=1000;g.stage++;g.barrels=[];h.x=50;h.y=423;h.vy=0}g.score+=dt*.006}
pDraw(g)}
function pDraw(g){const t=g.palette,m=g.mode;pBar(0,0,700,500,t.bg);
if(m==='jumper'){for(let i=0;i<36;i++)pCircle((i*113)%700,(i*89+g.elapsed*.009)%500,1.4,'#466785');for(const p of g.platforms){pBar(p.x,p.y,p.w,13,p.kind===2?t.c:p.kind===1?t.a:'#5fe1a9');pBar(p.x+3,p.y+10,p.w-6,4,t.b)}for(const c of g.coins)if(!c.got)pCircle(c.x,c.y,8,t.c);const h=g.hero;pCircle(h.x,h.y-6,15,t.a);pBar(h.x-13,h.y+5,26,12,t.b);pCircle(h.x-5,h.y-10,2,'#111522');pCircle(h.x+5,h.y-10,2,'#111522');pText('HEIGHT '+Math.floor(g.highest/5),350,27,19,t.c)}
if(m==='crosser'){for(let r=0;r<=10;r++){const row=g.rows.find(z=>z.r===r);pBar(0,16+r*43,700,42,r===0||r===10?'#276e50':row?.water?'#245ba3':'#313849');if(row&&!row.water)for(let x=0;x<700;x+=82)pBar(x,34+r*43,38,3,'#d8d8a8')}for(const row of g.rows)for(const a of row.cars){pBar(a.x,24+row.r*43,a.w,26,row.water?'#a17447':t.c);if(!row.water){pBar(a.x+8,19+row.r*43,a.w-16,10,t.b);pCircle(a.x+12,50+row.r*43,5,'#0a1426');pCircle(a.x+a.w-12,50+row.r*43,5,'#0a1426')}}for(const c of g.coins)if(!c.got)pCircle(30+c.col*49,37+c.row*43,9,'#ffdf70');pCircle(30+g.hero.col*49,37+g.hero.row*43,15,t.a);pCircle(25+g.hero.col*49,33+g.hero.row*43,3,'#102335');pCircle(35+g.hero.col*49,33+g.hero.row*43,3,'#102335');pText('CROSSINGS '+(g.stage-1),350,29,17,'#fff')}
if(m==='runner'){pBar(130,0,440,500,'#263449');for(let i=0;i<4;i++)pBar(130+i*146,0,4,500,'#dfc68b');for(let i=0;i<3;i++)for(let y=0;y<600;y+=65)pBar(203+i*145,(y+g.distance*9)%510,5,28,'#c5d6da');for(const b of g.blocks){const x=185+b.lane*145;pBar(x,b.y,78,b.kind==='high'?25:45,b.kind==='coin'?t.c:b.kind==='high'?t.a:'#ff6e91');if(b.kind==='coin')pCircle(x+39,b.y+16,12,'#fff0a5')}const h=g.hero;const px=224+h.lane*145;pBar(px-20,404-h.z,40,g.slide?22:46,t.a);pCircle(px-7,410-h.z,4,'#0e1e31');pCircle(px+7,410-h.z,4,'#0e1e31');pText('RUN '+Math.floor(g.distance)+' m',350,30,20,'#fff')}
if(m==='paddle'){for(const b of g.bricks)if(b.hp>0){pBar(b.x,b.y,b.w,b.h,b.hp===2?'#eee5f6':P_THEME[b.color].a);pBar(b.x+2,b.y+2,b.w-4,3,'#ffffff66')}for(const b of g.balls)pCircle(b.x,b.y,8,t.c);for(const q of g.power){pCircle(q.x,q.y,10,q.kind===0?'#92e6fd':q.kind===1?'#eeb3ff':'#ffe36b');pText(['W','M','L'][q.kind],q.x,q.y+4,11,'#172035')}for(const b of g.shots)pBar(b.x,b.y,4,14,'#ffdf79');pBar(g.paddle.x,455,g.paddle.w,14,t.a);pBar(g.paddle.x+12,458,g.paddle.w-24,5,t.b);pText('WAVE '+g.stage,350,30,19,t.c)}
if(m==='shooter'){for(let i=0;i<55;i++)pCircle((i*139)%700,(i*103+g.elapsed*.06)%500,1,'#385474');for(const e of g.foes){pBar(e.x-19,e.y-9,38,20,e.type==='armor'?'#ccb6f5':e.type==='zig'?t.c:'#ff8297');pBar(e.x-12,e.y-17,24,11,t.b);pCircle(e.x-7,e.y,3,'#12243d');pCircle(e.x+7,e.y,3,'#12243d')}for(const b of g.enemyBullets)pBar(b.x-2,b.y,4,13,'#ff8eaf');for(const b of g.bullets)pBar(b.x-2,b.y,4,15,t.c);for(const q of g.power)pCircle(q.x,q.y,10,'#a0f9bb');pBar(g.hero.x-20,g.hero.y-12,40,27,t.a);pBar(g.hero.x-5,g.hero.y-24,10,17,t.c);pText('SECTOR '+g.stage,350,30,19,t.c)}
if(m==='catcher'){for(let i=0;i<18;i++)pCircle((i*124)%700,(i*94)%500,2,'#3d5670');for(const a of g.fruit){pCircle(a.x,a.y,a.r,a.bad?'#ef5774':[t.c,t.a,'#b0f4a6'][Math.floor(a.x)%3]);if(a.bad)pText('!',a.x,a.y+6,20,'#151c31');else pBar(a.x-2,a.y-a.r-6,4,9,'#70e6a9')}if(g.variant!==0){pBar(g.hero.x-47,447,94,17,t.a);pBar(g.hero.x-42,459,84,7,t.b)}else{for(const v of g.trail)pCircle(v.x,v.y,5,'#c1f6fc');pText('SLICE FRUIT • AVOID BOMBS',350,30,18,'#fff')}pText('COMBO '+g.combo,590,37,16,t.c)}
if(m==='platform'){for(let i=0;i<5;i++){const y=445-i*84;pBar(0,y,700,13,i%2?'#e17a74':'#c76879');for(let j=0;j<12;j++)pBar(j*58,y+5,23,3,'#812e4b')}for(const ladder of g.ladders){for(let a=0;a<8;a++)pBar(ladder.x-12,ladder.y-a*10-80,24,3,'#f4b75f');pBar(ladder.x-12,ladder.y-160,4,160,'#f4b75f');pBar(ladder.x+9,ladder.y-160,4,160,'#f4b75f')}for(const a of g.barrels){pCircle(a.x,a.y,14,'#df8b57');pBar(a.x-11,a.y-2,22,4,'#6a3747')}pBar(550,47,92,25,'#78f3bc');pText('GOAL',595,65,14,'#12382a');pBar(g.hero.x-12,g.hero.y-19,24,24,t.a);pBar(g.hero.x-16,g.hero.y-31,30,12,t.c);pText('FLOOR '+(g.stage),345,27,18,'#fff')}
for(const p of g.particles)pBar(p.x,p.y,4,4,p.c);
if(g.special>0)pText('BONUS!',350,230,27,t.c);
pBar(0,0,700,4,t.a);pBar(0,496,700,4,t.b)}
function pSlice(g,x,y){if(!g||g.mode!=='catcher'||g.variant!==0)return;g.trail.push({x,y,life:140});for(const a of g.fruit)if(!a.hit&&pHit(a.x,a.y,x,y,a.r+20)){a.hit=true;if(a.bad){pLost(g);g.combo=0}else{g.combo++;g.score+=10+Math.min(g.combo,12)*5;pExplode(g,a.x,a.y,g.palette.c,17)}}g.fruit=g.fruit.filter(a=>!a.hit)}
canvas.addEventListener('pointermove',event=>{if(!game||game.mode!=='catcher'||game.variant!==0||!event.buttons)return;const r=canvas.getBoundingClientRect();pSlice(game,(event.clientX-r.left)*700/r.width,(event.clientY-r.top)*500/r.height)});
canvas.addEventListener('pointerdown',event=>{if(!game||game.mode!=='catcher'||game.variant!==0)return;const r=canvas.getBoundingClientRect();pSlice(game,(event.clientX-r.left)*700/r.width,(event.clientY-r.top)*500/r.height)});
