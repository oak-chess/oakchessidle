/* Rocket runs in its own realm and storage namespace; never replace the Idle journey. */
window.OAK_IDLE_MODE=false;
window.IDLE_ROCKET_EMBEDDED=true;
(()=>{'use strict';const prefix='oakchessidle:rocket-tft:',get=Storage.prototype.getItem,set=Storage.prototype.setItem,del=Storage.prototype.removeItem;
 Storage.prototype.getItem=function(k){return get.call(this,prefix+String(k))};
 Storage.prototype.setItem=function(k,v){return set.call(this,prefix+String(k),v)};
 Storage.prototype.removeItem=function(k){return del.call(this,prefix+String(k))};
 Storage.prototype.clear=function(){const keys=[];for(let i=0;i<this.length;i++){const k=this.key(i);if(k?.startsWith(prefix))keys.push(k)}for(const k of keys)del.call(this,k)};
 window.open=()=>null;
 document.addEventListener('click',e=>{const a=e.target.closest?.('a[href]');if(!a)return;const url=new URL(a.href,document.baseURI);if(a.hasAttribute('download')&&url.protocol==='blob:')return;e.preventDefault();e.stopImmediatePropagation()},true);
 document.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation()},true);
})();
