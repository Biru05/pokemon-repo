(function(){
'use strict';
let enabled=true,unlocked=false,context=null,clip=null,serial=0,toggle=null,status=null,lastClick=-1;
const buffers=new Map();
function message(text){if(status)status.textContent=text;}
function stop(){serial++;if(clip){try{clip.stop();}catch{}try{clip.disconnect();}catch{}clip=null;}}
function unlock(){if(!enabled)return;unlocked=true;try{const C=window.AudioContext||window.webkitAudioContext;if(C){context=context||new C();if(context.state==='suspended')context.resume().catch(()=>{});}}catch{} }
function click(){if(!enabled||!unlocked||!context)return;const now=context.currentTime;if(now-lastClick<0.045)return;lastClick=now;try{const o=context.createOscillator(),g=context.createGain();o.type='square';o.frequency.setValueAtTime(740,now);o.frequency.exponentialRampToValueAtTime(420,now+0.045);g.gain.setValueAtTime(0.024,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.055);o.connect(g);g.connect(context.destination);o.start(now);o.stop(now+0.06);}catch{} }
async function cry(p){
 if(!enabled||!unlocked||!p)return;
 stop();const id=serial,encoded=(window.POKEMON_CRY_BYTES||{})[p.Dex];
 if(p.Dex!==25||!encoded){message('');return;}
 if(!context){message('Sound is unavailable in this browser.');return;}
 message('');
 try{
  // Resume in the interaction task, before awaiting decoding.
  if(context.state==='suspended')await context.resume();
  let buffer=buffers.get(p.Dex);
  if(!buffer){
   const raw=atob(encoded),bytes=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   buffer=await context.decodeAudioData(bytes.buffer);
   if(buffers.size>=24)buffers.delete(buffers.keys().next().value);
   buffers.set(p.Dex,buffer);
  }
  // An older decode must never start after mute or a newer selection.
  if(id!==serial||!enabled||document.hidden)return;
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buffer;gain.gain.setValueAtTime(0.7,context.currentTime);
  source.connect(gain);gain.connect(context.destination);clip=source;
  source.onended=()=>{source.disconnect();gain.disconnect();if(id===serial){clip=null;message('');}};
  source.start();
 }catch(e){if(id===serial)message('Could not play '+p.Name+' voice. Try Hear name again. '+(e&&e.message||''));}
}
function sync(){if(!toggle)return;toggle.textContent=enabled?'Sound on':'Sound off';toggle.setAttribute('aria-pressed',String(enabled));toggle.title=enabled?'Mute button sounds and Pokémon voices':'Enable button sounds and Pokémon voices';}
function initialize(button){toggle=button;status=document.createElement('span');status.className='audio-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');document.querySelector('.topbar').appendChild(status);button.addEventListener('click',()=>{enabled=!enabled;stop();if(!enabled&&context)context.suspend().catch(()=>{});sync();if(enabled){unlock();click();}message('');});sync();document.addEventListener('click',e=>{if(!e.target.closest('button,a,summary,select'))return;if(e.target.closest('.sound-toggle'))return;unlock();click();},true);document.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,summary,select'))unlock();},true);document.addEventListener('change',e=>{if(e.target.matches('select')){unlock();click();}},true);document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){unlock();}},true);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});}
window.AtlasAudio={initialize,cry,stop,available:p=>p.Dex===25&&!!(window.POKEMON_CRY_BYTES||{})[25],voice:p=>p.Dex===25&&!!(window.POKEMON_CRY_BYTES||{})[25],enabled:()=>enabled};
})();
