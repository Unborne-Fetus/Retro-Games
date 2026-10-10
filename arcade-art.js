'use strict';
// Procedurally generated, original game-card artwork. No external imagery/assets.
function paintArcadeCard(g,host){
const canvas=document.createElement('canvas');canvas.width=420;canvas.height=232;canvas.setAttribute('aria-label',g.name+' artwork');host.textContent='';host.append(canvas);const c=canvas.getContext('2d');if(!c)return;
const seed=Array.from(g.name).reduce((n,v)=>((n*33+v.charCodeAt(0))>>>0),397),rand=n=>((Math.sin(seed+n*17.37)*43758.5453)%1+1)%1;
const mode=arcadeModes[g.id]?.mode||({'stars':'galaga','invaders':'invaders','maze':'maze','breakout':'paddle','snake':'snake','pong':'pong','asteroids':'asteroids','tetris':'tetris','frogger':'crosser','flappy':'flappy','game2048':'2048','dodge':'dodge','racer':'runner'})[g.id]||'shooter';
const scheme=[['#080d2a','#60eaff','#ff69b0'],['#28122f','#ffdf7f','#b084ff'],['#0c2a2e','#81f9c0','#ff8b7c'],['#25142b','#ffca74','#6acfff'],['#131833','#c1a7ff','#ff8dbd'],['#0e2645','#55e9e0','#ffdc85']][seed%6];
const fill=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h)},circle=(x,y,r,color)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill()},line=(x,y,x2,y2,color,width=2)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()};
const grad=c.createLinearGradient(0,0,0,232);grad.addColorStop(0,scheme[0]);grad.addColorStop(1,'#030711');fill(0,0,420,232,grad);
for(let i=0;i<40;i++)circle(rand(i)*420,rand(i+100)*232,rand(i+240)*1.5+.5,'#617a9a');
const drawShip=(x,y,color)=>{fill(x-22,y,44,12,color);fill(x-11,y-16,22,31,color);fill(x-4,y-22,8,29,'#e5fff3');fill(x-28,y+7,56,7,'#428da5')};
const invader=(x,y,col)=>{fill(x-17,y,34,17,col);fill(x-11,y-7,22,9,col);fill(x-9,y+5,6,5,'#0b1b32');fill(x+3,y+5,6,5,'#0b1b32');fill(x-21,y+11,7,10,col);fill(x+14,y+11,7,10,col)};
switch(mode){
case 'galaga':for(let r=0;r<3;r++)for(let j=0;j<7;j++)invader(68+j*46,30+r*38,r===0?'#f3647d':r===1?'#a17bff':'#f5d16d');drawShip(210,195,scheme[1]);fill(208,152,4,30,'#f9df7a');break;
case 'invaders':for(let r=0;r<3;r++)for(let j=0;j<7;j++)invader(68+j*46,30+r*38,'#84eec2');for(let k=0;k<4;k++)fill(40+k*96,178,55,15,'#397c6f');drawShip(210,203,scheme[1]);break;
case 'maze':for(let y=0;y<7;y++)for(let x=0;x<12;x++){if((x+y)%3===0||x===0||x===11){fill(29+x*29,13+y*29,26,24,'#304baf')}else circle(42+x*29,25+y*29,2,'#f8cd97')}circle(164,123,21,'#fce16c');for(let i=0;i<3;i++){circle(226+i*42,122,17,['#ff5d83','#6bdcff','#f7a3d0'][i]);fill(209+i*42,122,34,13,['#ff5d83','#6bdcff','#f7a3d0'][i]);circle(221+i*42,118,4,'white')}break;
case 'snake':for(let i=0;i<12;i++){const x=110+(i<7?i*18:6*18),y=62+Math.max(0,i-6)*19;fill(x,y,17,17,i===0?'#e9ffe3':'#5be49a')}circle(297,157,11,'#f481b1');break;
case 'pong':fill(36,72,9,90,scheme[1]);fill(375,85,9,90,scheme[2]);for(let i=0;i<8;i++)fill(209,i*32,3,18,'#7f93b2');circle(235,119,11,'#ffe49a');break;
case 'lander':{for(let i=0;i<=420;i+=14){const x=i,y=188+17*Math.sin(i*.031)+8*Math.cos(i*.087);if(i===0){c.beginPath();c.moveTo(x,y)}else c.lineTo(x,y)}c.strokeStyle='#c5f4e9';c.lineWidth=2;c.stroke();fill(260,170,86,5,'#8bfbe2');c.strokeStyle='#f6f5df';c.lineWidth=3;c.beginPath();c.moveTo(199,92);c.lineTo(207,83);c.lineTo(220,83);c.lineTo(230,93);c.lineTo(226,114);c.lineTo(202,114);c.closePath();c.stroke();line(205,114,194,129,'#f6f5df',2);line(226,114,237,129,'#f6f5df',2);line(187,129,201,129,'#f6f5df',2);line(230,129,244,129,'#f6f5df',2);fill(210,96,11,7,'#86ddfb');line(213,82,213,70,'#f6f5df',1);line(207,117,214,145,'#ffe48e',3);line(221,117,215,145,'#ffe48e',3);break;}
case 'asteroids':for(let i=0;i<7;i++){const x=rand(i+52)*420,y=rand(i+62)*190+10,r=12+rand(i+75)*22;c.beginPath();for(let q=0;q<9;q++){const a=q*2*Math.PI/9,rr=r*(.75+rand(q+i*13)*.35);if(q===0)c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);else c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.strokeStyle='#b6c9e4';c.lineWidth=3;c.stroke()}drawShip(210,156,scheme[1]);break;
case 'tetris':for(let y=0;y<9;y++)for(let x=0;x<10;x++)fill(130+x*17,25+y*20,15,18,'#1b3051');for(const [i,p] of [[0,[[4,2],[5,2],[5,3],[5,4]]],[1,[[6,5],[7,5],[7,6],[8,6]]],[2,[[3,7],[3,8],[4,8],[5,8]]]])for(const [x,y] of p)fill(130+x*17,25+y*20,15,18,[scheme[1],scheme[2],'#f7e477'][i]);break;
case '2048':for(let y=0;y<3;y++)for(let x=0;x<4;x++){fill(85+x*65,14+y*65,58,58,['#ddcbaa','#e5b76e','#e58f6f','#eed77f'][x]);c.fillStyle='#273347';c.textAlign='center';c.font='bold 24px monospace';c.fillText(String(2**(x+y+1)),114+x*65,50+y*65)}break;
case 'flappy':for(let i=0;i<3;i++){const x=80+i*140,y=rand(i)*80+45;fill(x,0,43,y,'#58e5a0');fill(x,y+78,43,232,'#58e5a0');fill(x-4,y-9,51,11,'#99f2ba')}circle(210,108,19,'#ffe178');circle(217,101,4,'#27344d');break;
case 'paddle':for(let y=0;y<5;y++)for(let x=0;x<8;x++)fill(41+x*43,23+y*23,38,17,['#ff75a3','#ffac75','#fee585','#7deca6','#7dbaff'][y]);fill(161,196,98,12,scheme[1]);circle(210,170,9,'#fff0af');break;
case 'jumper':for(let i=0;i<6;i++){const x=rand(i+13)*280+30,y=180-i*28;fill(x,y,93,11,scheme[i%2?1:2])}circle(219,100,17,'#ffe3a5');fill(203,109,31,21,scheme[1]);break;
case 'crosser':for(let y=0;y<5;y++){fill(0,17+y*44,420,39,y%2?'#344452':'#276b4b');if(y%2)for(let x=0;x<420;x+=75)fill(x,35+y*44,40,3,'#dfd69c')}for(let i=0;i<5;i++){const x=(i*94+20)%420,y=30+(i%5)*44;fill(x,y,49,22,'#f08e85');fill(x+8,y-6,32,8,'#56aacc')}circle(210,200,16,'#fbdf7f');break;
case 'runner':fill(80,0,260,232,'#34455e');for(let x=0;x<3;x++){line(123+x*85,0,123+x*85,232,'#c8c9b2',3)}for(let i=0;i<6;i++)fill(172+(i%2)*85,i*47,6,26,'#dbe7e8');fill(184,148,52,58,scheme[1]);fill(96,68,55,38,scheme[2]);break;
case 'shooter':for(let i=0;i<9;i++){const x=40+(i%5)*76,y=32+Math.floor(i/5)*64;invader(x,y,scheme[i%2?2:1])}drawShip(210,200,'#60edec');fill(207,146,6,34,'#ffe28b');break;
case 'catcher':for(let i=0;i<11;i++){const x=40+rand(i)*335,y=35+rand(i+40)*110;circle(x,y,10+rand(i+20)*5,i%5===0?'#f57185':i%2?scheme[1]:scheme[2])}fill(145,187,130,15,scheme[1]);fill(164,201,90,12,scheme[2]);break;
case 'platform':for(let i=0;i<4;i++)fill(0,200-i*52,420,11,i%2?'#ba6681':'#de8e76');for(let i=0;i<4;i++){fill(70+i*77,145-i*39,11,56,'#f3b569')}circle(250,58,21,'#be794f');circle(190,117,15,'#e6b86b');fill(70,164,23,29,scheme[1]);break;
case 'dodge':for(let i=0;i<5;i++){fill(40+i*81,177,45,28,'#7298bc');line(rand(i)*420,0,40+i*81,172,'#ff789c',2)}circle(210,140,35,'#55dce766');break;
default:drawShip(210,160,scheme[1]);break;
}
const shade=c.createLinearGradient(0,0,0,232);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#00000055');fill(0,0,420,232,shade);
c.strokeStyle='#ffffff25';c.lineWidth=6;c.strokeRect(3,3,414,226);
}
render();
