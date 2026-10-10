'use strict';
// Lunar Lander: an independently drawn vector-arcade landing simulation.
// Physics are measured in pixels/frame at 60 FPS and scaled by elapsed time.
const LANDER_W=700, LANDER_H=500, LANDER_PI=Math.PI;
const landerClamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function landerInit(g){
 g.type='lander';g.score=0;g.wave=1;g.lives=3;g.fuel=850;g.elapsed=0;
 g.high=0;try{g.high=Number(localStorage.getItem('retro-lunar-lander-high')||0)}catch{}
 g.stars=Array.from({length:100},(_,i)=>({x:(i*239+19)%700,y:(i*127+23)%465,r:(i%9===0?1.6:.8)}));
 g.sparks=[];g.message='';g.phase='flying';g.transition=0;g.wind=0;g.stageBonus=0;
 landerStage(g);
}
function landerStage(g){
 const lvl=g.wave;
 g.phase='flying';g.transition=0;g.elapsed=0;g.message='';g.sparks=[];
 // Three genuine landing zones with increasing precision requirements.
 const jitter=Math.sin(lvl*11.7)*21;
 const wide=Math.max(77,126-lvl*2.3);
 const mid=Math.max(64,95-lvl*1.5);
 const narrow=Math.max(49,68-lvl);
 g.pads=[
  {x:57+jitter*.25,w:wide,y:364+Math.sin(lvl*.8)*12,mult:2},
  {x:310+jitter,w:mid,y:395+Math.cos(lvl*.7)*10,mult:3},
  {x:550-jitter*.7,w:narrow,y:351+Math.sin(lvl*.6)*20,mult:5}
 ];
 g.gravity=Math.min(.067,.041+(lvl-1)*.0023);
 g.wind=lvl>=4?Math.sin(lvl*4.15)*.0045:0;
 const marks=new Set([0,700]);for(let x=0;x<=700;x+=23)marks.add(x);
 for(const p of g.pads)for(const x of [p.x-26,p.x,p.x+p.w,p.x+p.w+26])marks.add(landerClamp(x,0,700));
 g.terrain=[...marks].sort((a,b)=>a-b).map(x=>{
  const pad=g.pads.find(p=>x>=p.x-.001&&x<=p.x+p.w+.001);
  if(pad)return{x,y:pad.y};
  let y=378+Math.sin(x*.025+lvl*.3)*37+Math.sin(x*.084+lvl)*14+Math.cos(x*.061+lvl*1.83)*16;
  y=landerClamp(y,317,450);
  for(const p of g.pads){
   const edge=x<p.x?p.x:x>p.x+p.w?p.x+p.w:x;
   const delta=Math.abs(x-edge);if(delta<26)y=p.y+(y-p.y)*(delta/26);
  }
  return{x,y};
 });
 g.ship={x:360,y:92,vx:(lvl%2?.16:-.12),vy:.13,angle:0};
 g.thrust=false;g.thrustBurst=0;g.blink=1300;
 if(lvl>1)g.fuel=Math.min(1000,g.fuel+200);
}
function landerTerrainAt(g,x){
 const pts=g.terrain;x=landerClamp(x,0,700);
 let lo=0,hi=pts.length-1;
 while(hi-lo>1){const m=(lo+hi)>>1;if(pts[m].x<=x)lo=m;else hi=m}
 const a=pts[lo],b=pts[hi];return a.y+(b.y-a.y)*(x-a.x)/Math.max(.01,b.x-a.x);
}
function landerSave(g){if(g.score>g.high){g.high=g.score;try{localStorage.setItem('retro-lunar-lander-high',String(g.high))}catch{}}}
function landerParticle(g,x,y,c,amount=14){
 for(let i=0;i<amount;i++){const ang=(i/amount)*Math.PI*2+Math.random()*.3,speed=.5+Math.random()*2.9;
 g.sparks.push({x,y,vx:Math.cos(ang)*speed,vy:Math.sin(ang)*speed,life:450+Math.random()*400,c})}
}
function landerCrash(g){
 if(g.phase!=='flying')return;
 g.phase='crash';g.transition=1500;g.lives--;g.message='CRASH LANDING';
 landerParticle(g,g.ship.x,g.ship.y,'#ffb06e',27);
 if(typeof arcadeSfx==='function')arcadeSfx('blast');
 if(g.lives<=0){g.over=true;landerSave(g)}
}
function landerTouchDown(g,pad){
 if(g.phase!=='flying')return;
 g.phase='landed';g.transition=1750;
 const precision=Math.max(0,Math.round(250-(Math.abs(g.ship.vx)*76+Math.abs(g.ship.vy)*86+Math.abs(g.ship.angle)*260)));
 const bonus=pad.mult*100+precision+Math.floor(g.fuel*.18);
 g.score+=bonus;g.stageBonus=bonus;g.message='PERFECT TOUCHDOWN';
 landerSave(g);
 landerParticle(g,g.ship.x-14,g.ship.y+15,'#6dfff0',8);
 landerParticle(g,g.ship.x+14,g.ship.y+15,'#ffe59a',8);
 if(typeof arcadeSfx==='function')arcadeSfx('stage');
}
function landerUpdate(g,dt){
 const frames=Math.min(2.4,dt/16.667);
 const h=g.ship;
 for(const a of g.sparks){a.x+=a.vx*frames;a.y+=a.vy*frames;a.vy+=.037*frames;a.life-=dt}
 g.sparks=g.sparks.filter(a=>a.life>0);
 if(g.phase==='crash'||g.phase==='landed'){
  g.transition-=dt;if(g.transition<=0&&!g.over){if(g.phase==='landed')g.wave++;landerStage(g)}
  landerDraw(g);return;
 }
 g.elapsed+=dt;
 const turn=(held('ArrowRight','d','D')?1:0)-(held('ArrowLeft','a','A')?1:0);
 h.angle=landerClamp(h.angle+turn*.044*frames,-Math.PI,Math.PI);
 g.thrust=held('ArrowUp','w','W','Space')&&g.fuel>0;
 if(g.thrust){
  const burn=Math.min(g.fuel,.65*frames);
  g.fuel-=burn;
  h.vx+=Math.sin(h.angle)*.105*frames*(burn/(.65*frames));
  h.vy-=Math.cos(h.angle)*.105*frames*(burn/(.65*frames));
  if(Math.random()<Math.min(1,frames*1.1)){
   const c=Math.cos(h.angle),sn=Math.sin(h.angle);
   g.sparks.push({x:h.x+sn*15,y:h.y+c*15,vx:sn*(1.8+Math.random()*2)+h.vx,vy:c*(2.3+Math.random()*2)+h.vy,life:160+Math.random()*170,c:Math.random()<.5?'#ffe2a4':'#ff9b60'})}
 }
 h.vx+=(g.wind)*frames;h.vy+=g.gravity*frames;
 h.vx=landerClamp(h.vx,-5.5,5.5);h.vy=landerClamp(h.vy,-5.5,5.5);
 h.x+=h.vx*frames;h.y+=h.vy*frames;
 if(h.x<16||h.x>LANDER_W-16||h.y<25){landerCrash(g);landerDraw(g);return}
 // Approximate the rotated lander's collision by checking each landing leg.
 const sin=Math.sin(h.angle),cos=Math.cos(h.angle);
 const leg1={x:h.x-15*cos-15*sin,y:h.y-15*sin+15*cos};
 const leg2={x:h.x+15*cos-15*sin,y:h.y+15*sin+15*cos};
 const leftFloor=landerTerrainAt(g,leg1.x),rightFloor=landerTerrainAt(g,leg2.x);
 if(leg1.y>=leftFloor||leg2.y>=rightFloor){
  const pad=g.pads.find(p=>leg1.x>=p.x+2&&leg2.x<=p.x+p.w-2);
  const slow=Math.abs(h.vx)<=1.15&&Math.abs(h.vy)<=1.55&&h.vy>=0&&Math.abs(h.angle)<=.21;
  if(pad&&slow&&leg1.y<=pad.y+7&&leg2.y<=pad.y+7){
   h.y=pad.y-15;h.vx=0;h.vy=0;h.angle=0;landerTouchDown(g,pad)
  }else landerCrash(g);
 }
 // Prevent moving through steep terrain between simulation frames.
 if(g.phase==='flying'&&(h.y-15>=landerTerrainAt(g,h.x)||h.y>LANDER_H+10))landerCrash(g);
 landerDraw(g);
}
function landerDraw(g){
 const h=g.ship;
 const top=ctx.createLinearGradient(0,0,0,500);top.addColorStop(0,'#060c18');top.addColorStop(1,'#0d1d2d');
 ctx.fillStyle=top;ctx.fillRect(0,0,700,500);
 for(const s of g.stars){ctx.fillStyle=s.r>1?'#849bb1':'#51687e';ctx.fillRect(s.x,s.y,s.r,s.r)}
 // Distant moon and parallax silhouette.
 ctx.strokeStyle='#7c9ca84a';ctx.lineWidth=1;ctx.beginPath();ctx.arc(580,91,39,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle='#334958';ctx.beginPath();ctx.moveTo(0,433);
 for(let x=0;x<=700;x+=10)ctx.lineTo(x,418+25*Math.sin(x*.013+g.wave*.23)+12*Math.sin(x*.052));
 ctx.stroke();
 // Moon terrain in bright vector-style lines; pads are flat and highlighted.
 ctx.beginPath();ctx.moveTo(0,500);ctx.lineTo(g.terrain[0].x,g.terrain[0].y);
 for(const p of g.terrain)ctx.lineTo(p.x,p.y);
 ctx.lineTo(700,500);ctx.closePath();ctx.fillStyle='#0e1c29';ctx.fill();
 ctx.strokeStyle='#b4e7dd';ctx.lineWidth=2;ctx.beginPath();
 for(let i=0;i<g.terrain.length;i++){const p=g.terrain[i];if(!i)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y)}ctx.stroke();
 for(const pad of g.pads){
  const light=.72+.28*Math.sin(g.elapsed*.006);
  ctx.strokeStyle=pad.mult===5?'#ffe08a':pad.mult===3?'#9beaf7':'#96f6c7';
  ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(pad.x+2,pad.y);ctx.lineTo(pad.x+pad.w-2,pad.y);ctx.stroke();
  ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pad.x,pad.y-9);ctx.lineTo(pad.x,pad.y+5);ctx.moveTo(pad.x+pad.w,pad.y-9);ctx.lineTo(pad.x+pad.w,pad.y+5);ctx.stroke();
  ctx.textAlign='center';ctx.font='bold 15px monospace';ctx.fillStyle=pad.mult===5?'#ffe08a':'#a6ffe9';
  ctx.fillText('×'+pad.mult,pad.x+pad.w/2,pad.y+26);
 }
 if(g.phase!=='crash'){
  ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.angle);ctx.lineWidth=2;ctx.strokeStyle='#f1f5e6';
  // Lunar module: cabin, antenna, descent engine, shock legs.
  ctx.beginPath();ctx.moveTo(-11,-8);ctx.lineTo(-7,-15);ctx.lineTo(7,-15);ctx.lineTo(11,-8);ctx.lineTo(11,5);ctx.lineTo(7,11);ctx.lineTo(-7,11);ctx.lineTo(-11,5);ctx.closePath();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-7,11);ctx.lineTo(-15,15);ctx.lineTo(-20,15);ctx.moveTo(7,11);ctx.lineTo(15,15);ctx.lineTo(20,15);ctx.moveTo(0,-15);ctx.lineTo(0,-22);ctx.lineTo(5,-26);ctx.stroke();
  ctx.fillStyle='#a5eaf6';ctx.fillRect(-5,-8,10,7);
  ctx.strokeStyle='#f6cc6e';ctx.strokeRect(-6,10,12,4);
  if(g.thrust&&g.phase==='flying'){ctx.strokeStyle='#ffdd94';ctx.beginPath();ctx.moveTo(-5,15);ctx.lineTo(0,22+Math.random()*14);ctx.lineTo(5,15);ctx.stroke()}
  ctx.restore();
 }
 for(const p of g.sparks){ctx.globalAlpha=Math.min(1,p.life/320);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;
 // Flight instrumentation: readable, practical values independent of display scale.
 ctx.fillStyle='#090e1bcc';ctx.fillRect(8,8,684,48);
 ctx.textAlign='left';ctx.font='bold 14px monospace';
 ctx.fillStyle='#e5f0e9';ctx.fillText('LUNAR LANDER',19,26);
 ctx.fillStyle='#9bebf0';ctx.fillText('STAGE '+g.wave,190,26);ctx.fillText('SCORE '+g.score,325,26);
 ctx.fillStyle='#ffe397';ctx.fillText('HI '+Math.max(g.high,g.score),560,26);
 ctx.fillStyle='#b5deca';ctx.font='bold 13px monospace';
 const altitude=Math.max(0,landerTerrainAt(g,h.x)-(h.y+15));
 ctx.fillText('ALT '+altitude.toFixed(0),19,46);
 ctx.fillText('V/S '+h.vy.toFixed(2),143,46);ctx.fillText('H/S '+h.vx.toFixed(2),263,46);
 ctx.fillText('ANGLE '+(h.angle*180/Math.PI).toFixed(0)+'°',383,46);
 ctx.fillText('FUEL '+Math.ceil(g.fuel),538,46);
 const ratio=Math.max(0,g.fuel/1000);
 ctx.strokeStyle='#90d9c8';ctx.strokeRect(530,64,149,9);
 ctx.fillStyle=ratio<.18?'#ff899b':'#78e9bd';ctx.fillRect(532,66,145*ratio,5);
 ctx.font='12px monospace';ctx.textAlign='left';ctx.fillStyle='#9bb4c2';
 ctx.fillText('← → ROTATE     ↑ / SPACE THRUST     TOUCH: ◀ ▲ ▶',15,490);
 ctx.textAlign='right';ctx.fillText('LIVES '+g.lives,683,490);
 if(g.phase==='landed'||g.phase==='crash'){
  ctx.fillStyle='#06101be7';ctx.fillRect(134,181,431,114);
  ctx.strokeStyle=g.phase==='landed'?'#8af5ce':'#ff8594';ctx.strokeRect(134,181,431,114);
  ctx.textAlign='center';ctx.font='bold 29px monospace';ctx.fillStyle=g.phase==='landed'?'#9af5d5':'#ff8e9c';
  ctx.fillText(g.message,350,226);
  ctx.font='bold 16px monospace';ctx.fillStyle='#f2e0a0';
  ctx.fillText(g.phase==='landed'?'BONUS +'+g.stageBonus+'  •  NEXT MISSION':'HULL LOST  •  '+(g.lives?'RETRYING':'GAME OVER'),350,266);
 }
}
