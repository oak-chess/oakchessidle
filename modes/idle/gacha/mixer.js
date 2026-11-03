/* Small equal-mass circle simulation, local to the demonstration machine. */
window.createEggMixer=function(chamber){
 const nodes=[...chamber.querySelectorAll('.capsules>i')],radius=21.5;let balls=[],frame=0,last=0,elapsed=0,mode='idle',width=0,height=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function init(){width=chamber.clientWidth;height=chamber.clientHeight;balls=nodes.map((node,i)=>{const css=getComputedStyle(node);return {node,x:width/2+parseFloat(css.getPropertyValue('--x')),y:height/2+parseFloat(css.getPropertyValue('--y')),vx:0,vy:0,angle:i*37,spin:0,kick:i*.11}});for(let i=0;i<180;i++)step(1/120,false);paint()}
 function step(dt,mix){elapsed+=dt;const wall=radius+3,floor=height-radius-5;
  for(const b of balls){b.vy+=420*dt;if(mix){const dx=b.x-width/2,dy=b.y-height*.63;b.vx+=(-dy*5+Math.sin(elapsed*8+b.angle*.02)*95)*dt;b.vy+=dx*3.3*dt;b.kick-=dt;if(b.kick<=0&&b.y>height*.53){b.vy=-135-Math.random()*70;b.vx+=(width/2-b.x)*1.9+(Math.random()-.5)*65;b.spin+=(Math.random()-.5)*120;b.kick=.55+Math.random()*.65}}
   b.vx*=Math.pow(mix?.994:.975,dt*120);b.vy*=Math.pow(.998,dt*120);b.x+=b.vx*dt;b.y+=b.vy*dt;b.angle+=(b.vx*1.1+b.spin)*dt;b.spin*=.985;
   if(b.x<wall){b.x=wall;b.vx=Math.abs(b.vx)*.7}if(b.x>width-wall){b.x=width-wall;b.vx=-Math.abs(b.vx)*.7}if(b.y<radius+3){b.y=radius+3;b.vy=Math.abs(b.vy)*.58}if(b.y>floor){b.y=floor;b.vy=-Math.abs(b.vy)*.42;b.vx*=.94;if(Math.abs(b.vy)<7)b.vy=0}
  }
  // Several positional passes keep the packed capsules from visibly overlapping.
  for(let pass=0;pass<4;pass++)for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){const a=balls[i],b=balls[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.001,min=radius*2;if(d>=min)continue;const nx=dx/d,ny=dy/d,push=(min-d)*.5;a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;const closing=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(closing<0){const impulse=-closing*.79;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;a.spin-=ny*impulse;b.spin+=ny*impulse}for(const c of [a,b]){c.x=Math.max(wall,Math.min(width-wall,c.x));c.y=Math.max(radius+3,Math.min(floor,c.y))}}
 }
 function paint(){for(const b of balls)b.node.style.transform='translate(calc(-50% + '+(b.x-width/2).toFixed(2)+'px),calc(-50% + '+(b.y-height/2).toFixed(2)+'px)) rotate('+b.angle.toFixed(2)+'deg)'}
 function tick(time){if(mode==='idle')return;const dt=Math.min(.04,Math.max(0,(time-last)/1000||.016));last=time;let remaining=dt;while(remaining>0){const part=Math.min(remaining,1/120);step(part,mode==='mix');remaining-=part}paint();frame=requestAnimationFrame(tick)}
 function start(){if(reduced())return;if(!balls.length)init();mode='mix';if(!frame){last=performance.now();frame=requestAnimationFrame(tick)}}
 function settle(){if(mode!=='idle')mode='settle'}
 function stop(){mode='idle';cancelAnimationFrame(frame);frame=0;last=0}
 if(chamber.clientWidth>0)init();return {start,settle,stop,prepare(){if(!balls.length&&chamber.clientWidth>0)init()},snapshot:()=>balls.map(b=>({x:b.x,y:b.y,radius,vx:b.vx,vy:b.vy})),bounds:()=>({width,height})};
};
