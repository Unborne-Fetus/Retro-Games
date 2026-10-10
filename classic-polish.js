'use strict';
// Original art/logic for richer classic-inspired mini-games; no copyrighted arcade assets.
const C_INVA=['..cc..cc..','...cccc...','.cccccccc.','cc.cccc.cc','cccccccccc','c.cc..cc.c','c.c....c.c'];
const C_SQUID=['...cc....','..cccc...','.cccccc..','cc.cc.cc.','cccccccc.','..c..c...','.c.cc.c..','c.c..c.c.'];
const C_CRAB=['.c......c.','..c....c..','.cccccccc.','cc.cccc.cc','cccccccccc','c.cc..cc.c','c..c..c..','..c..c...'];
function cSprite(rows,x,y,color,scale=2){for(let i=0;i<rows.length;i++)for(let j=0;j<rows[i].length;j++)if(rows[i][j]!==' '&&rows[i][j]!=='.')rect(Math.round(x+j*scale),Math.round(y+i*scale),scale,scale,color)}
function classicInit(g){
g.best=0;try{g.best=Number(localStorage.getItem('arcade-best-'+g.type)||0)}catch{}
g.shake=0;g.message='';g.messageTimer=0;g.fx=[];
if(g.type==='invaders'){g.lives=3;g.wave=1;g.score=0;g.ship={x:339,y:443,w:32,h:19};g.cool=0;g.enemyClock=0;g.fireClock=850;g.drift=1;g.ufo=null;g.ufoClock=11000;g.bullets=[];g.enemyBullets=[];g.barriers=[];g.aliens=[];cWave(g)}
if(g.type==='maze'){g.power=0;g.combo=0;g.ghostTimer=0;g.fruit=null;g.fruitClock=12000;g.stage=1;g.inv=750;g.pacDirection=[1,0];g.lastDirection=[1,0];cMazePower(g)}
if(g.type==='breakout'){g.drops=[];g.lastScore=0;g.pierce=0;g.paddlePower=0;g.level=1}
if(g.type==='snake'){g.gold=null;g.goldTimer=5000;g.obstacles=[];g.level=1}
if(g.type==='pong'){g.trail=[];g.spark=0}
if(g.type==='asteroids'){g.saucer=null;g.saucerClock=12000;g.lastScore=0;g.warp=0}
if(g.type==='tetris'){g.holdPiece=null;g.holdUsed=false;g.prevBoard=0;g.level=1}
if(g.type==='frogger'){g.frogHomes=[false,false,false,false,false];g.timer=60000}
if(g.type==='flappy'){g.medal=0;g.clouds=Array.from({length:9},()=>({x:Math.random()*700,y:40+Math.random()*260,w:45+Math.random()*75}));g.trail=[]}
if(g.type==='game2048'){g.undoBoard=null;g.lastBoard=JSON.stringify(g.board)}
if(g.type==='dodge'){g.cities=Array.from({length:5},(_,i)=>({x:95+i*126,alive:true}));g.wave=1}
if(g.type==='racer'){g.skyline=Array.from({length:22},(_,i)=>({x:i*38,w:25+Math.random()*24,h:25+Math.random()*95}));g.speed=140;g.curve=0}
}
function cWave(g){g.aliens=[];for(let y=0;y<5;y++)for(let x=0;x<11;x++)g.aliens.push({x:93+x*45,y:85+y*34,formX:x,row:y,hp:1});g.barriers=[];for(let group=0;group<4;group++)for(let y=0;y<4;y++)for(let x=0;x<8;x++){if(y===3&&(x===3||x===4))continue;g.barriers.push({x:73+group*165+x*8,y:363+y*7,hp:3})}g.drift=1;g.enemyClock=0;g.fireClock=1050;g.message='WAVE '+g.wave;g.messageTimer=1400}
function cMazePower(g){for(const [x,y] of [[1,1],[19,1],[1,13],[19,13]])if(g.map[y][x]==='.')g.remaining--;for(const [x,y] of [[1,1],[19,1],[1,13],[19,13]])g.map[y][x]='o';g.map[1][1]=' ';g.ghosts=[{x:19,y:13,spawn:[19,13],color:'#ff647e',dir:[-1,0]},{x:19,y:1,spawn:[19,1],color:'#60d9f4',dir:[0,1]},{x:1,y:13,spawn:[1,13],color:'#f8a6dc',dir:[1,0]}];g.player={x:1,y:1};g.remaining=g.map.flat().filter(x=>x==='.'||x==='o').length}
function cMsg(g,message,time=1200){g.message=message;g.messageTimer=time}
function cHit(g,x,y,c){g.fx.push({x,y,age:0,c});g.shake=8}
function cDamage(g){if(g.inv>0)return;g.lives--;g.inv=1300;cHit(g,g.player.x,g.player.y,'#ff78a1');if(g.lives<=0){g.over=true;classicHigh(g)}}
function classicUpdate(g,dt){
if(g.type==='invaders')cInvaders(g,dt);else if(g.type==='maze')cMaze(g,dt);
}
function cInvaders(g,dt){const s=dt/16.667;g.cool-=dt;g.enemyClock+=dt;g.fireClock-=dt;g.ufoClock-=dt;g.messageTimer=Math.max(0,g.messageTimer-dt);
g.ship.x=Math.max(10,Math.min(656,pointerX!==null?pointerX-16:g.ship.x+(held('ArrowRight','d','D')?5*s:0)-(held('ArrowLeft','a','A')?5*s:0)));
if(held('Space')&&g.cool<=0){g.bullets.push({x:g.ship.x+15,y:428,vy:-8.6});g.cool=250}
const interval=Math.max(75,520-g.wave*36-g.score/170);
if(g.enemyClock>interval){g.enemyClock=0;const live=g.aliens.filter(a=>!a.dead);if(live.some(a=>a.x+g.drift*8<18||a.x+g.drift*8>660)){g.drift*=-1;for(const a of live)a.y+=13}else for(const a of live)a.x+=g.drift*8}
if(g.fireClock<=0){const live=g.aliens.filter(a=>!a.dead);if(live.length){const shooters=[];for(const a of live)if(!live.some(b=>b.formX===a.formX&&b.y>a.y))shooters.push(a);if(shooters.length){const a=shooters[Math.floor(Math.random()*shooters.length)];g.enemyBullets.push({x:a.x+10,y:a.y+13,vy:3+g.wave*.25})}}g.fireClock=Math.max(280,1030-g.wave*60)}
if(g.ufoClock<=0&&!g.ufo){g.ufo={x:-55,vx:1.7+g.wave*.15};g.ufoClock=10000+Math.random()*6000}
if(g.ufo){g.ufo.x+=g.ufo.vx*s;if(g.ufo.x>740)g.ufo=null}
for(const b of g.bullets){b.y+=b.vy*s;for(const a of g.aliens)if(!a.dead&&Math.abs(b.x-a.x-10)<14&&Math.abs(b.y-a.y-9)<13){a.dead=true;b.dead=true;g.score+=[30,20,20,10,10][a.row];cHit(g,a.x,a.y,'#ffe377');break}
if(g.ufo&&b.y<76&&Math.abs(b.x-g.ufo.x)<23){g.score+=100;b.dead=true;cHit(g,g.ufo.x,58,'#ff8dc9');g.ufo=null}
for(const cell of g.barriers)if(cell.hp>0&&b.x>=cell.x&&b.x<=cell.x+8&&b.y>=cell.y&&b.y<=cell.y+8){cell.hp--;b.dead=true;break}}
for(const b of g.enemyBullets){b.y+=b.vy*s;for(const cell of g.barriers)if(cell.hp>0&&b.x>=cell.x&&b.x<=cell.x+8&&b.y>=cell.y&&b.y<=cell.y+8){cell.hp--;b.dead=true;break}if(b.y>437&&b.y<464&&b.x>g.ship.x-4&&b.x<g.ship.x+35){b.dead=true;g.lives--;cHit(g,g.ship.x+16,452,'#ff7fa8');if(g.lives<=0){g.over=true;classicHigh(g)}}}
g.bullets=g.bullets.filter(b=>!b.dead&&b.y>0);g.enemyBullets=g.enemyBullets.filter(b=>!b.dead&&b.y<510);
for(const a of g.aliens)if(!a.dead&&a.y>=428){g.over=true;classicHigh(g)}
if(!g.aliens.some(a=>!a.dead)){g.wave++;g.score+=100;classicHigh(g);cWave(g)}
cInvaderDraw(g)}
function cInvaderDraw(g){rect(0,0,700,500,'#050712');for(let i=0;i<65;i++)rect((i*137)%700,(i*79)%500,1,1,'#273651');rect(0,0,700,40,'#11162d');text('SCORE '+g.score,130,26,19,'#eff5ff');text('HIGH '+Math.max(g.score,g.best),350,26,19,'#ffe07e');text('WAVE '+g.wave,575,26,19,'#eff5ff');rect(0,474,700,3,'#74e99d');
for(const a of g.aliens)if(!a.dead)cSprite(a.row===0?C_SQUID:a.row<3?C_CRAB:C_INVA,a.x,a.y,['#ed82dd','#ac92ff','#a3d7ff','#87f0d1','#b9ee98'][a.row],2.15);
for(const cell of g.barriers)if(cell.hp>0)rect(cell.x,cell.y,8,7,['','#447c82','#55b0b8','#79f2df'][cell.hp]);if(g.ufo){rect(g.ufo.x-20,54,40,11,'#ee668c');rect(g.ufo.x-11,47,22,9,'#f8b2a4');rect(g.ufo.x-8,59,5,4,'#ffffa8')}
cSprite(['....w....','...www...','..wwwww..','wwwwwwwww','wwwwwwwww'],g.ship.x+6,435,'#73e8bd',3);for(const b of g.bullets)rect(b.x,b.y,4,15,'#f8e587');for(const b of g.enemyBullets)rect(b.x,b.y,4,15,'#ff8aa6');for(let i=0;i<g.lives;i++)cSprite(['..w..','wwwww','wwwww'],30+i*27,482,'#70f0c0',2);
if(g.messageTimer>0)text(g.message,350,256,30,'#ffdf76');classicFx(g)}
function cMaze(g,dt){g.tick+=dt;g.power=Math.max(0,g.power-dt);g.inv=Math.max(0,g.inv-dt);g.fruitClock-=dt;g.ghostTimer+=dt;if(g.fruitClock<=0&&!g.fruit){const spots=[[9,11],[10,13],[7,7],[13,7]];const [x,y]=spots.find(([x,y])=>g.map[y]?.[x]!== '#')||[10,13];g.fruit={x,y,clock:7400};g.fruitClock=20000}
if(g.fruit){g.fruit.clock-=dt;if(g.fruit.clock<0)g.fruit=null}
const wanted=held('ArrowUp','w','W')?[0,-1]:held('ArrowDown','s','S')?[0,1]:held('ArrowLeft','a','A')?[-1,0]:held('ArrowRight','d','D')?[1,0]:null;
if(wanted)g.pacDirection=wanted;
if(g.tick>125){g.tick=0;const walk=(obj,d)=>{const x=obj.x+d[0],y=obj.y+d[1];if(g.map[y]&&g.map[y][x]&&g.map[y][x]!=='#'){obj.x=x;obj.y=y;return true}return false};
if(!walk(g.player,g.pacDirection))walk(g.player,g.lastDirection);else g.lastDirection=g.pacDirection;const tile=g.map[g.player.y][g.player.x];
if(tile==='.'||tile==='o'){g.score+=tile==='o'?50:10;g.remaining--;g.map[g.player.y][g.player.x]=' ';if(tile==='o'){g.power=8500;g.combo=0;cMsg(g,'POWER MODE',650)}}
if(g.fruit&&g.fruit.x===g.player.x&&g.fruit.y===g.player.y){g.score+=200;g.fruit=null}
if(g.ghostTimer>220){g.ghostTimer=0;for(const ghost of g.ghosts){const choices=[[0,-1],[0,1],[-1,0],[1,0]].filter(d=>g.map[ghost.y+d[1]]?.[ghost.x+d[0]]!==undefined&&g.map[ghost.y+d[1]]?.[ghost.x+d[0]]!=='#');if(!choices.length)continue;const goal=g.power>0?[20-g.player.x,14-g.player.y]:[g.player.x,g.player.y];const opts=choices.slice().sort((a,b)=>{const da=Math.abs(ghost.x+a[0]-goal[0])+Math.abs(ghost.y+a[1]-goal[1]);const db=Math.abs(ghost.x+b[0]-goal[0])+Math.abs(ghost.y+b[1]-goal[1]);return g.power>0?db-da:da-db});let dir=Math.random()<.25?choices[Math.floor(Math.random()*choices.length)]:opts[0];ghost.x+=dir[0];ghost.y+=dir[1]}}
for(const ghost of g.ghosts)if(ghost.x===g.player.x&&ghost.y===g.player.y){if(g.power>0){g.combo++;g.score+=200*Math.pow(2,Math.min(3,g.combo-1));ghost.x=ghost.spawn[0];ghost.y=ghost.spawn[1]}else if(g.inv===0){g.lives--;g.inv=1800;g.player.x=1;g.player.y=1;if(g.lives<=0){g.over=true;classicHigh(g)}}}
if(g.remaining<=0){g.stage++;g.score+=500;const old=g.score,lives=g.lives;g.map=[
'#####################','#.........#.........#','#.###.###.#.###.###.#','#...#.....#.....#...#','###.#.#########.#.###','#...#...........#...#','#.#####.#####.#####.#','#.......#...#.......#','#.#####.#.#.#.#####.#','#...#...#.#.#...#...#','###.#.###.#.###.#.###','#.....#.......#.....#','#.###.#.#####.#.###.#','#...#...........#...#','#####################'].map(s=>s.split(''));cMazePower(g);g.score=old;g.lives=lives;g.inv=1300}}
cMazeDraw(g)}
function cMazeDraw(g){rect(0,0,700,500,'#03040e');text('1UP '+g.score,122,25,19,'#ffe981');text('HIGH '+Math.max(g.score,g.best),360,25,19,'#fff');text('LEVEL '+g.stage,579,25,19,'#78ddff');const unit=26,ox=77,oy=48;
for(let y=0;y<15;y++)for(let x=0;x<21;x++){const cell=g.map[y]?.[x],px=ox+x*unit,py=oy+y*unit;if(cell==='#'){rect(px+1,py+1,unit-2,unit-2,'#172c90');rect(px+5,py+5,unit-10,unit-10,'#061242')}if(cell==='.')pCircle(px+13,py+13,3,'#ffcaa6');if(cell==='o')pCircle(px+13,py+13,7,'#ffe39c')}
const cx=ox+13+g.player.x*unit,cy=oy+13+g.player.y*unit;ctx.fillStyle='#ffe14b';ctx.beginPath();let face=Math.atan2(g.lastDirection[1],g.lastDirection[0]),mouth=Math.abs(Math.sin(g.time*.018))*.54+.11;ctx.moveTo(cx,cy);ctx.arc(cx,cy,11,face+mouth,face+2*Math.PI-mouth);ctx.closePath();ctx.fill();
for(const z of g.ghosts){const x=ox+z.x*unit+13,y=oy+z.y*unit+13;const col=g.power>0?'#2c77e9':z.color;rect(x-11,y,22,10,col);pCircle(x,y,11,col);pCircle(x-4,y-2,4,'#fff');pCircle(x+5,y-2,4,'#fff');pCircle(x-3,y-2,2,'#203254');pCircle(x+6,y-2,2,'#203254')}
if(g.fruit)pCircle(ox+g.fruit.x*unit+13,oy+g.fruit.y*unit+13,9,'#ff5578');for(let i=0;i<g.lives;i++)pCircle(120+i*32,475,10,'#ffe04f');if(g.power>0)text('POWER '+Math.ceil(g.power/1000)+'s',560,476,17,'#7bd8ff');classicFx(g)}
function classicPost(g,dt){if(g.type==='invaders'||g.type==='maze'||g.type==='stars'||g.type.startsWith('extra')||g.type.startsWith('variant'))return;g.messageTimer=Math.max(0,g.messageTimer-dt);g.shake=Math.max(0,g.shake-dt*.02);
if(g.score>g.best)classicHigh(g);
switch(g.type){
case 'breakout': {if(g.score>g.lastScore){g.lastScore=g.score;if(Math.random()<.27)g.drops.push({x:Math.random()*600+40,y:110,type:Math.floor(Math.random()*3)});g.shake=4}
g.paddlePower=Math.max(0,g.paddlePower-dt);g.pierce=Math.max(0,g.pierce-dt);g.paddle.w=g.paddlePower>0?150:100;g.drops.forEach(d=>{d.y+=2*dt/16;if(d.y>450&&d.x>=g.paddle.x&&d.x<=g.paddle.x+g.paddle.w){d.dead=true;if(d.type===0)g.paddlePower=10500;if(d.type===1){g.lives++;g.score+=50}else g.pierce=6500}});g.drops=g.drops.filter(d=>!d.dead&&d.y<510);if(g.bricks.every(b=>!b.alive)){g.level++;g.bricks=[];for(let j=0;j<5;j++)for(let i=0;i<10;i++)g.bricks.push({x:40+i*63,y:65+j*29,w:56,h:21,alive:true,color:['#fe69ab','#faad70','#fff07a','#63dfa2','#6bbcff'][j]});g.over=false;g.score+=250}classicDraw(g);break}
case 'snake':{g.goldTimer-=dt;if(g.goldTimer<=0&&!g.gold){g.gold={x:Math.floor(Math.random()*25),y:Math.floor(Math.random()*17),life:5000};g.goldTimer=9000}if(g.gold){g.gold.life-=dt;if(g.gold.life<=0)g.gold=null;else if(g.body[0].x===g.gold.x&&g.body[0].y===g.gold.y){g.score+=50;g.gold=null}}classicDraw(g);break}
case 'asteroids': {g.saucerClock-=dt;if(g.saucerClock<=0){g.saucer={x:-40,y:60+Math.random()*200};g.saucerClock=14500}if(g.saucer){g.saucer.x+=2*dt/16;if(g.saucer.x>740)g.saucer=null}if(g.score>g.lastScore){g.shake=3;g.lastScore=g.score}classicDraw(g);break}
case 'pong': {g.trail.push({x:g.ball.x,y:g.ball.y,life:220});g.trail=g.trail.filter(q=>(q.life-=dt)>0);classicDraw(g);break}
case 'tetris':{g.level=1+Math.floor(g.score/550);if(held('c','C')&&!g.holdLatch){g.holdLatch=true;const p=g.shape.map(row=>row.slice());if(g.holdPiece){g.shape=g.holdPiece.map(row=>row.slice());g.holdPiece=p;g.px=3;g.pieceY=0}else{g.holdPiece=p;newPiece(g)}if(collides(g,g.shape,g.px,g.pieceY))g.over=true}if(!held('c','C'))g.holdLatch=false;classicDraw(g);break}
case 'frogger':{g.timer-=dt;if(g.timer<=0){g.timer=60000;g.lives--;if(g.lives<=0)g.over=true}classicDraw(g);break}
case 'flappy':{g.clouds.forEach(c=>{c.x-=dt*.012;if(c.x<-100)c.x=780});classicDraw(g);break}
case 'game2048':{classicDraw(g);break}
case 'dodge':{g.wave=1+Math.floor(g.score/350);classicDraw(g);break}
case 'racer':{g.speed=Math.min(320,140+g.score*.17);g.curve=Math.sin(g.time*.0004)*35;classicDraw(g);break}
}}
function classicHigh(g){if(g.score>g.best){g.best=g.score;try{localStorage.setItem('arcade-best-'+g.type,String(g.best))}catch{}}}
function classicFx(g){for(const f of g.fx){f.age+=16;if(f.age>380)continue;for(let j=0;j<10;j++){const angle=j*Math.PI/5;rect(f.x+Math.cos(angle)*f.age*.12,f.y+Math.sin(angle)*f.age*.12,3,3,f.c)}}g.fx=g.fx.filter(f=>f.age<380)}
function classicDraw(g){switch(g.type){
case 'invaders':cInvaderDraw(g);break;case 'maze':cMazeDraw(g);break;
case 'breakout':{for(const p of g.drops){pCircle(p.x,p.y,11,['#81eeff','#fbe97e','#fb8cbd'][p.type]);text(['W','+','P'][p.type],p.x,p.y+5,14,'#182441')}text('LEVEL '+g.level,350,39,20,'#fff');if(g.paddlePower>0)text('WIDE PADDLE',560,39,14,'#7bf8da');break}
case 'snake':{if(g.gold)pCircle(110+g.gold.x*20,64+g.gold.y*20,9,'#f9d95a');text('SNAKE • BONUS FOOD',350,33,18,'#d4eaff');break}
case 'pong':{for(const q of g.trail)pCircle(q.x,q.y,Math.max(1,q.life/70),'#8acbe9');text('FIRST TO 7',350,484,17,'#ccdcff');break}
case 'asteroids':{if(g.saucer){rect(g.saucer.x-20,g.saucer.y,42,12,'#ff749a');rect(g.saucer.x-11,g.saucer.y-8,24,12,'#e9d88b')}text('ROCKS '+g.rocks.length,595,34,16,'#cde2ff');break}
case 'tetris':{if(g.holdPiece){rect(46,76,132,105,'#162543');text('HOLD [C]',108,69,16,'#a8d4f1');for(let y=0;y<g.holdPiece.length;y++)for(let x=0;x<g.holdPiece[y].length;x++)if(g.holdPiece[y][x])rect(78+x*17,104+y*17,15,15,'#64dfea')}text('LEVEL '+g.level,565,95,21,'#fce789');break}
case 'frogger':{text('TIME '+Math.ceil(g.timer/1000),354,32,18,'#ffe987');break}
case 'flappy':{for(const c of g.clouds){pCircle(c.x,c.y,22,'#263d68');pCircle(c.x+18,c.y+5,15,'#263d68')}text('SCORE '+g.score,350,55,26,'#fff');break}
case 'game2048':{text('BEST '+Math.max(g.score,g.best),350,35,20,'#ffe59d');break}
case 'dodge':{for(const a of g.cities){rect(a.x-28,470,55,22,'#8bc1c4');rect(a.x-12,455,24,18,'#7fadb9');rect(a.x-3,445,7,12,'#d1e8d9')}text('DEFENSE WAVE '+g.wave,350,35,19,'#fff');break}
case 'racer':{for(const b of g.skyline)rect(b.x,130-b.h,b.w,b.h,'#1f3553');rect(130,0,5,500,'#7ad6c3');rect(565,0,5,500,'#7ad6c3');const x=g.playerX,y=407;rect(x-17,y+8,34,47,'#20c3ec');rect(x-12,y+17,24,13,'#afd5ef');rect(x-22,y+47,10,14,'#0c1834');rect(x+12,y+47,10,14,'#0c1834');text('SPEED '+Math.floor(g.speed),350,40,20,'#ffe68b');break}
}}
