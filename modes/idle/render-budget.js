/* Track open native windows without scanning the whole document every frame. */
(()=>{const stage=document.getElementById('stage');if(!stage)return;const roots=new Set();let busy=false;
function update(){let next=false;for(const root of roots){if(!root.isConnected){roots.delete(root);continue}if(!root.hidden&&!(root.id==='idle-records'&&root.dataset.view==='report'))next=true}if(next===busy)return;busy=next;window.IDLE_PANEL_OPEN=busy;document.body.classList.toggle('idle-panel-render-budget',busy)}
const states=new MutationObserver(update);function mount(){for(const root of stage.querySelectorAll(':scope>.idle-window'))if(!roots.has(root)){roots.add(root);states.observe(root,{attributes:true,attributeFilter:['hidden','data-view']})}update()}
new MutationObserver(mount).observe(stage,{childList:true});mount();})();
