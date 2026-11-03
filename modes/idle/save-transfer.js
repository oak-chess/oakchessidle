/* Standalone page: uses raw localStorage, without the game's prefix wrapper. */
(()=>{'use strict';
const prefix='oakchessidle:',main=prefix+'journey-native-v2',fresh=prefix+'official-start-v1';
function validate(raw){
 const unsafe=value=>value&&typeof value==='object'&&Object.entries(value).some(([k,v])=>['__proto__','prototype','constructor'].includes(k)||unsafe(v));
 if(!raw||unsafe(raw))throw Error('Arquivo de backup inválido.');
 let entries;
 if(raw.format==='oakchess-idle'&&raw.version===1)entries={[main]:JSON.stringify(raw.state)};
 else if(raw.format==='oakchess-idle-transfer'&&raw.version===1)entries=raw.entries;
 else throw Error('Escolha um backup do OakChess Idle.');
 if(entries&&typeof entries==='object')entries=Object.fromEntries(Object.entries(entries).map(([k,v])=>[k.startsWith('oakchess-idle:')?prefix+k.slice('oakchess-idle:'.length):k,v]));
 if(!entries||Array.isArray(entries)||typeof entries!=='object'||Object.keys(entries).length>2000)throw Error('Dados de transferência inválidos.');
 for(const [key,value] of Object.entries(entries))if(!key.startsWith(prefix)||typeof value!=='string')throw Error('O arquivo contém dados que não pertencem ao Idle.');
 const state=JSON.parse(entries[main]||'null');
 if(!state||!Array.isArray(state.team)||!state.team.length||!Array.isArray(state.collection)||!Array.isArray(state.items)||!state.world||!Array.isArray(state.world.badges)||!Number.isFinite(state.gold)||state.gold<0||!Number.isInteger(state.area)||state.area<0)throw Error('O arquivo não contém uma jornada válida.');
 return {...entries,[fresh]:'1'};
}
function snapshot(storage){const entries={};for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix))entries[key]=storage.getItem(key)}return entries}
function restore(storage,entries){const previous=snapshot(storage);try{for(const key of Object.keys(previous))if(!(key in entries))storage.removeItem(key);for(const [key,value] of Object.entries(entries))storage.setItem(key,value)}catch(error){for(const key of Object.keys(snapshot(storage)))if(!(key in previous))storage.removeItem(key);for(const [key,value] of Object.entries(previous))storage.setItem(key,value);throw error}}
window.IDLE_SAVE_TRANSFER={validate,snapshot,restore};
const $=id=>document.getElementById(id);if(!$('export'))return;
let pending;const status=text=>$('status').textContent=text;const enabled=()=>$('import').disabled=!(pending&&$('confirm').checked);
$('export').onclick=()=>{try{const entries=snapshot(localStorage);validate({format:'oakchess-idle-transfer',version:1,entries});const blob=new Blob([JSON.stringify({format:'oakchess-idle-transfer',version:1,exportedAt:new Date().toISOString(),entries},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='oakchessidle-progresso.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Cópia preparada. Guarde o arquivo antes de mudar de endereço.')}catch(error){status(error.message)}};
$('file').onchange=async()=>{pending=null;$('confirm').checked=false;enabled();try{const file=$('file').files[0];if(!file)return;if(file.size>20*1024*1024)throw Error('Arquivo muito grande.');pending=validate(JSON.parse(await file.text()));const state=JSON.parse(pending[main]);$('preview').textContent=`${state.team.length} parceiros na equipe · ${state.collection.length} no PC · ${Number(state.gold).toLocaleString('pt-BR')} Coins`;status('Backup válido. Confira o resumo antes de confirmar.')}catch(error){$('preview').textContent='Backup não carregado.';status(error.message)}enabled()};
$('confirm').onchange=enabled;
$('import').onclick=()=>{if(!pending||!$('confirm').checked)return;try{restore(localStorage,pending);pending=null;enabled();status('Progresso importado. Agora você pode abrir o OakChess Idle.')}catch(error){status('Não foi possível importar. Verifique o espaço de armazenamento do navegador. '+error.message)}};
})();
