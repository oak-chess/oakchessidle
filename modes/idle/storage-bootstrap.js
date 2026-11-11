/* Copy once from the original game, then keep independent saves. */
window.OAK_IDLE_MODE=true;
(()=>{'use strict';
 const get=Storage.prototype.getItem,set=Storage.prototype.setItem,del=Storage.prototype.removeItem;
 const prefix='oakchessidle:',legacy='oakchess-idle:',main='journey-native-v2',marker=prefix+'legacy-copy-v1';
 try{
  if(!get.call(localStorage,prefix+main)&&!get.call(localStorage,marker)){
   const raw=get.call(localStorage,legacy+main);
   if(raw){const state=JSON.parse(raw);if(!state||!Array.isArray(state.team)||!state.world)throw Error('Progresso antigo inválido.');
    const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(legacy))keys.push(k)}
    const copied=[];try{for(const key of keys){const target=prefix+key.slice(legacy.length);if(get.call(localStorage,target)===null){set.call(localStorage,target,get.call(localStorage,key));copied.push(target)}}set.call(localStorage,prefix+'official-start-v1','1');set.call(localStorage,marker,'1')}catch(error){for(const key of copied)del.call(localStorage,key);throw error}
   }
  }
  // Never clear a saved journey, including imports and recovery after quota errors.
  set.call(localStorage,prefix+'official-start-v1','1');
 }catch(error){console.warn('[OakChess Idle] Não foi possível copiar o progresso antigo. Use a transferência por backup.',error)}
 // Auth belongs to the origin and must be shared with the home and chat iframe.
 // Only game data is namespaced; never import a legacy test session as identity.
 const storageKey=k=>/^sb-.+-auth-token(?:.*)$/.test(String(k))?String(k):prefix+k;
 Storage.prototype.getItem=function(k){return get.call(this,storageKey(k))};
 Storage.prototype.setItem=function(k,v){return set.call(this,storageKey(k),v)};
 Storage.prototype.removeItem=function(k){return del.call(this,storageKey(k))};
})();
