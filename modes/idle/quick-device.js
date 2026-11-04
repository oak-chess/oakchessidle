/* Preserve original actions and accessible labels; switch skins only after the atlas loads. */
(()=>{
 let ready=false;
 function mount(){const nav=document.querySelector('.is-quick');if(!ready||!nav)return false;if(nav.classList.contains('is-device-quick'))return true;const buttons=nav.querySelectorAll(':scope>button');if(buttons.length!==5)return false;
  buttons.forEach((b,i)=>{b.dataset.quickDevice=['shop','automation','report','rewards','vip'][i];b.removeAttribute('title');if(i===4){const face=document.createElement('span');face.className='vip-device-face';const label=document.createElement('span');label.textContent='Loja VIP';face.append(label);const crown=document.createElement('i');face.append(crown);b.append(face)}});nav.classList.add('is-device-quick');return true;
 }
 const timer=setInterval(()=>{if(mount())clearInterval(timer)},100),art=new Image();art.onload=()=>{ready=true;if(mount())clearInterval(timer)};art.onerror=()=>{clearInterval(timer);console.warn('Arte dos atalhos indisponível; botões originais preservados.')};art.src=new URL('modes/idle/assets/quick-menu/buttons-atlas.png',document.baseURI).href;
})();
