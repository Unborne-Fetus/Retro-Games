'use strict';
// Optional sound effects synthesized with Web Audio; no copyrighted sound samples.
let arcadeSoundEnabled=true,arcadeAudioContext=null;
try{arcadeSoundEnabled=localStorage.getItem('arcade-sound-muted')!=='1'}catch{}
function arcadeUnlockSound(){
 if(!arcadeSoundEnabled)return;
 try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!arcadeAudioContext)arcadeAudioContext=new C();if(arcadeAudioContext.state==='suspended')arcadeAudioContext.resume().catch(()=>{})}catch{}
}
function arcadeSfx(name){
 if(!arcadeSoundEnabled)return;
 try{
  arcadeUnlockSound();const a=arcadeAudioContext;if(!a||a.state!=='running')return;
  const types={shoot:[850,380,.085,'square'],blast:[260,62,.22,'sawtooth'],hurt:[160,44,.27,'sawtooth'],pickup:[480,930,.16,'triangle'],rescue:[315,1080,.33,'triangle'],capture:[660,115,.44,'sawtooth'],stage:[380,900,.29,'triangle'],bonus:[630,1100,.23,'square'],hit:[460,260,.10,'square']};
  const v=types[name]||types.hit,osc=a.createOscillator(),gain=a.createGain(),t=a.currentTime;
  osc.type=v[3];osc.frequency.setValueAtTime(v[0],t);osc.frequency.exponentialRampToValueAtTime(Math.max(1,v[1]),t+v[2]);
  gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.045,t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+v[2]);
  osc.connect(gain).connect(a.destination);osc.start(t);osc.stop(t+v[2]+.008);
 }catch{}
}
function arcadeToggleSound(){
 arcadeSoundEnabled=!arcadeSoundEnabled;
 if(!arcadeSoundEnabled&&arcadeAudioContext?.state==='running')arcadeAudioContext.suspend().catch(()=>{});
 if(arcadeSoundEnabled)arcadeUnlockSound();
 try{localStorage.setItem('arcade-sound-muted',arcadeSoundEnabled?'0':'1')}catch{}
 const b=document.querySelector('#soundButton');if(b){b.textContent=arcadeSoundEnabled?'🔊 Sound On':'🔇 Sound Off';b.setAttribute('aria-pressed',String(arcadeSoundEnabled))}
}
const arcadeSoundButton=document.querySelector('#soundButton');
if(arcadeSoundButton){arcadeSoundButton.textContent=arcadeSoundEnabled?'🔊 Sound On':'🔇 Sound Off';arcadeSoundButton.setAttribute('aria-pressed',String(arcadeSoundEnabled));arcadeSoundButton.addEventListener('click',arcadeToggleSound)}
