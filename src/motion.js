(function(){
'use strict';
const media=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
let enabled=!(media&&media.matches),observer=null,frames=new Set(),animations=new Set(),lastKey='',toggle=null,counts=new Map();
function active(){return enabled&&!(media&&media.matches);}
function animate(node,keys,options){if(!active()||!node||typeof node.animate!=='function')return;const a=node.animate(keys,options);animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);return a;}
function clean(){counts.forEach((target,node)=>{node.textContent=String(target);});counts.clear();if(observer)observer.disconnect();observer=null;frames.forEach(id=>cancelAnimationFrame(id));frames.clear();animations.forEach(a=>a.cancel());animations.clear();}
function update(){document.documentElement.classList.toggle('motion-off',!active());if(toggle){toggle.textContent=active()?'Motion on':'Motion off';toggle.setAttribute('aria-pressed',String(active()));toggle.disabled=!!(media&&media.matches);toggle.title=toggle.disabled?'Reduced motion is enabled in your system preferences':'Toggle decorative animations';}if(!active())clean();window.dispatchEvent(new Event('atlas-motion-change'));}
function frame(fn){const id=requestAnimationFrame(time=>{frames.delete(id);fn(time);});frames.add(id);}
function count(node){const target=Number(node.textContent);if(!Number.isFinite(target))return;node.setAttribute('aria-label',String(target));node.setAttribute('aria-live','off');counts.set(node,target);const start=performance.now();function tick(now){if(!node.isConnected||!active()){node.textContent=String(target);return;}const progress=Math.min(1,(now-start)/650);node.textContent=String(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1)frame(tick);else counts.delete(node);}frame(tick);}
function mount(root,key){clean();const enter=lastKey!==key;lastKey=key;if(!active())return;
 if(enter){const nodes=[...root.querySelectorAll('.section-heading,.hero,.kpi,.card,.panel,.pick,.evolution-edge')];const reveal=(n,i)=>animate(n,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay:Math.min(i%8*35,210),easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'});
 if('IntersectionObserver' in window){observer=new IntersectionObserver(entries=>{entries.forEach((e,i)=>{if(e.isIntersecting){reveal(e.target,i);observer.unobserve(e.target);}});},{threshold:.08});nodes.forEach(n=>observer.observe(n));}else nodes.forEach(reveal);
 root.querySelectorAll('.kpi strong').forEach(count);
 }
 if(window.matchMedia&&window.matchMedia('(hover: hover) and (pointer: fine)').matches){root.querySelectorAll('.card').forEach(card=>{let pending=false;card.addEventListener('pointermove',e=>{if(!active()||pending)return;pending=true;frame(()=>{pending=false;if(!card.isConnected)return;const r=card.getBoundingClientRect();card.style.setProperty('--rx',(-(e.clientY-r.top-r.height/2)/r.height*4)+'deg');card.style.setProperty('--ry',((e.clientX-r.left-r.width/2)/r.width*4)+'deg');});});card.addEventListener('pointerleave',()=>{card.style.setProperty('--rx','0deg');card.style.setProperty('--ry','0deg');});});}
}
function detail(root){root.querySelectorAll('.track i').forEach((n,i)=>animate(n,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:500,delay:i*40,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'}));animate(root.querySelector('.detail-art'),[{opacity:0,transform:'translateY(12px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:450,easing:'ease-out'});}
function chart(node){animate(node,[{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});}
function initialize(button){toggle=button;button.addEventListener('click',()=>{enabled=!enabled;update();});update();if(media&&media.addEventListener)media.addEventListener('change',()=>{enabled=!media.matches;update();});}
window.AtlasMotion={mount,detail,chart,initialize,active,clean};
})();
