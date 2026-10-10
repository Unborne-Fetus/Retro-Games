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
 if(builtin.length!==261)issues.push('Expected 261 games, got '+builtin.length);
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
assert.equal(result.total,261);
assert.equal(result.checked,50);
assert.deepEqual(Array.from(result.issues),[]);
const pack=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
for(const s of scripts)assert(pack.build.files.includes(s),'Missing Windows bundle file: '+s);
console.log('PASS: 50 games started and simulated, 261 catalog entries, Windows assets present.');
