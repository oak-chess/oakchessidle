/* Settings sample uses the same neon renderer as combat, without combat state. */
(()=>{
 const pane=document.querySelector('#menu [data-pane="visual"] .mgroup');if(!pane)return;
 const row=document.createElement('div');row.className='mrow hex-neon-setting';
 row.innerHTML='<div class="mtop"><label class="ml" for="hexNeonIntensity"><span class="mt">Neon dos hexágonos<small class="ms">Brilho da prévia dos golpes na arena</small></span></label><output class="mv" id="hexNeonPercent" for="hexNeonIntensity"></output></div><input id="hexNeonIntensity" type="range" min="0" max="2" step=".05" aria-describedby="hexNeonHelp"><div class="hex-neon-limits"><span>Sem neon</span><span>Intenso</span></div><canvas width="360" height="108" role="img" aria-label="Prévia da intensidade em hexágonos amarelo, azul e laranja"></canvas><small id="hexNeonHelp">Prévia do brilho · o contorno dos ataques continua visível em 0%.</small>';
 pane.prepend(row);
 const range=row.querySelector('input'),label=row.querySelector('output'),canvas=row.querySelector('canvas');
 window.syncHexNeonSetting=()=>{const raw=Number(CFG.hexNeon),value=Number.isFinite(raw)?Math.max(0,Math.min(2,raw)):.5;range.value=value;label.textContent=Math.round(value*100)+'%';paintRange(range);window.HEX_ATTACKS?.previewNeon(canvas)};
 range.addEventListener('input',()=>{CFG.hexNeon=Number(range.value);saveCfg();window.syncHexNeonSetting()});
 window.syncHexNeonSetting();
})();
