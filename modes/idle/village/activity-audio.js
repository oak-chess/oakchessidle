/* Original procedural activity sounds: no recordings copied from other games. */
window.createRuralActivityAudio=function(){
 let context,enabled=true;const counts={};
 function play(kind){const volume=Math.max(0,Math.min(1,window.IDLE_ACTIVITY_VOLUME??1));if(!enabled||document.hidden||!volume)return;try{
  context??=new(window.AudioContext||window.webkitAudioContext)();context.resume();counts[kind]=(counts[kind]||0)+1;const now=context.currentTime;
  const notes={click:[600],cast:[360,240],bite:[880,1175],hook:[440,660],hit:[784,1046],miss:[240,180],lose:[330,247,165],win:[523,659,784,1046],reel:[210,260]}[kind]||[440];
  notes.forEach((f,i)=>{const o=context.createOscillator(),g=context.createGain(),t=now+i*.075;o.type=['click','reel'].includes(kind)?'triangle':'sine';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*(kind==='cast'?.55:1.03),t+.15);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime((kind==='click'?.045:.12)*volume,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(context.destination);o.start(t);o.stop(t+.2)});
  if(['cast','hook','bite','lose','win'].includes(kind)){const duration=kind==='cast'?.35:.18,buffer=context.createBuffer(1,context.sampleRate*duration,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=kind==='cast'?1700:900;gain.gain.setValueAtTime(.18*volume,now);gain.gain.exponentialRampToValueAtTime(.001,now+duration);source.connect(filter);filter.connect(gain);gain.connect(context.destination);source.start(now)}
 }catch{}}
 return{play,setEnabled(value){enabled=!!value},get enabled(){return enabled},snapshot:()=>({...counts})};
};
