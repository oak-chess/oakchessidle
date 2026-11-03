/* Decorative atlas only: native controls, live meters and XP effects retain ownership. */
(()=>{
 const image=new Image();
 image.onload=()=>{
  document.body.classList.add('idle-team-device');
  const decorate=()=>{
   for(const card of document.querySelectorAll('.is-team-card')){
    for(const icon of card.querySelectorAll('.is-card-types img')){
     if(icon.parentElement.classList.contains('is-device-type'))continue;
     const chip=document.createElement('span');chip.className='is-device-type';
     const label=document.createElement('span');label.className='is-device-type-name';label.textContent=icon.alt;icon.before(chip);chip.append(icon,label);
    }
   }
  };
  const wait=()=>{const team=document.querySelector('.is-team');if(!team){requestAnimationFrame(wait);return}decorate();new MutationObserver(decorate).observe(team,{childList:true,subtree:true})};wait();
 };
 image.src='modes/idle/assets/team-device/frames-atlas.png';
})();
