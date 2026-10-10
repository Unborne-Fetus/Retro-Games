/* Offline smoke tests for the browser arcade using a mocked canvas and DOM. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const inline=html.match(/<script>([\s\S]*?)<\/script>/);
assert(inline,'main script missing');
const scripts=Array.from(html.matchAll(/<script src="([^"]+)"><\/script>/g),m=>m[1]);
assert(scripts.includes('galaga.js')&&scripts.includes('arcade-polish.js')&&scripts.includes('classic-polish.js'),'polish engines not loaded');
const noop=()=>{};
const canvasContext=new Proxy({
createLinearGradient:()=>({addColorStop:noop}),
measureText:()=>({width:20})
},{get:(o,k)=>k in o?o[k]:noop,set:(o,k,v)=>(o[k]=v,true)});
const all=new Map();
function element(){return{value:'',style:{},dataset:{},classList:{toggle:noop},files:[],append:noop,replaceChildren:noop,addEventListener:noop,getContext:()=>canvasContext,getBoundingClientRect:()=>({left:0,top:0,width:700,height:500}),showModal:noop,close:noop,removeAttribute:noop,setAttribute:noop,textContent:'',width:700,height:500}}
function get(s){if(!all.has(s))all.set(s,element());return all.get(s)}
const storage=new Map();
const sandbox={document:{querySelector:get,querySelectorAll:()=>[],createElement:element,getElementById:get,addEventListener:noop},window:{addEventListener:noop},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))},requestAnimationFrame:()=>1,cancelAnimationFrame:noop,confirm:()=>true,console,Math};
vm.createContext(sandbox);
vm.runInContext(inline[1],sandbox,{filename:'index.html'});
for(const filename of scripts)vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),sandbox,{filename});
const runGames=function(){
 const issues=[],names=[];
 if(builtin.length!==262)issues.push('Expected 262 games, got '+builtin.length);
 for(let i=0;i<50;i++){
  const name=builtin[i].name;
  try{
    active=builtin[i];startGame();
    for(let step=0;step<100;step++){
      keys.clear();
      if(step%8<5)keys.add(step%16<8?'ArrowLeft':'ArrowRight');
      if(step%7===0)keys.add('Space');
      if(step%29===0)keys.add('ArrowUp');
      if(step%43===0)keys.add('ArrowDown');
      loop((step+1)*16.67);
    }
    names.push(name);
  }catch(err){issues.push(name+': '+err.stack)}
 }
 return {total:builtin.length,checked:names.length,issues};
};
const result=vm.runInContext('('+runGames.toString()+')()',sandbox);
assert.equal(result.total,262);
assert.equal(result.checked,50);
assert.deepEqual(Array.from(result.issues),[]);
const landerTest=vm.runInContext(`(()=>{
 const g={type:'lander',score:0,lives:3,time:0,frame:0,over:false};
 landerInit(g);
 const pad=g.pads[1];g.ship.x=pad.x+pad.w/2;g.ship.y=pad.y-19;g.ship.vx=0;g.ship.vy=.95;g.ship.angle=0;
 for(let i=0;i<6&&g.phase==='flying';i++)landerUpdate(g,16.667);
 const success=g.phase==='landed'&&g.score>0;
 if(success)landerUpdate(g,1800);
 const advanced=g.wave===2;
 // Cause an unsafe high-speed impact and ensure a life is deducted.
 const hardPad=g.pads[0];g.ship.x=hardPad.x+hardPad.w/2;g.ship.y=hardPad.y-21;g.ship.vy=5;g.ship.vx=2;g.ship.angle=.6;
 for(let i=0;i<3&&g.phase==='flying';i++)landerUpdate(g,16.667);
 const crash=g.phase==='crash'&&g.lives===2;
 return {success,advanced,crash,entries:builtin.length};
})()`,sandbox);
assert(landerTest.success,'Lunar Lander must award points for a controlled touchdown');
assert(landerTest.advanced,'Lunar Lander must advance to next mission');
assert(landerTest.crash,'Lunar Lander must penalize an unsafe collision');
const pack=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
for(const s of scripts)assert(pack.build.files.includes(s),'Missing Windows bundle file: '+s);
console.log('PASS: 50 games started and simulated, Lunar Lander land/crash verified, 262 catalog entries, Windows assets present.');
