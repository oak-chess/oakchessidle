/* Rebuild the local Rocket shell from this repository, not a URL or another checkout. */
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<base href="./">','<base href="../../">');
html=html.replace(/<script\b[^>]*src="modes\/idle\/[^"?]+(?:\?[^"\s]*)?"[^>]*><\/script>/g,'');
html=html.replace(/<link\b[^>]*href="modes\/idle\/[^"?]+(?:\?[^"\s]*)?"[^>]*>/g,'');
// Presentation and navigation to other modes are unnecessary in the isolated host.
html=html.replace(/<script\b[^>]*src="assets\/(?:trainer-profile|game-home)\/[^"?]+(?:\?[^"\s]*)?"[^>]*><\/script>/g,'');
html=html.replace(/<link\b[^>]*href="assets\/(?:trainer-profile|game-home)\/[^"?]+(?:\?[^"\s]*)?"[^>]*>/g,'');
// Campaign achievements, route events and badge UI do not belong to Rocket runs.
const campaignOnly='achievements|regional-events|alternative-routes|mystery-events|badge-case|legendary-encounter';
html=html.replace(new RegExp('<script\\b[^>]*src="assets/(?:'+campaignOnly+')\\.js(?:\\?[^"\\s]*)?"[^>]*></script>','g'),'');
html=html.replace(new RegExp('<link\\b[^>]*href="assets/(?:'+campaignOnly+')\\.css(?:\\?[^"\\s]*)?"[^>]*>','g'),'');
html=html.replace(/<script\b[^>]*id="(?:tutorial-carvalho-js|title-v3-js|actual-battle-video)"[^>]*>[\s\S]*?<\/script>/g,'');
html=html.replace(/^.*pane\('jogo'\)\.insertAdjacentHTML\('beforeend',switchRow\('recordReplays'.*$/m,'');
html=html.replace(/<link\b[^>]*href="https?:[^"\s]*"[^>]*>/g,'');
html=html.replace('<title>OakChess Idle</title>','<title>OakChess Idle · Operação Rocket</title>');
html=html.replace('<meta charset="utf-8">','<meta charset="utf-8"><script src="modes/rocket/storage.js?v=1"></script>');
html=html.replace(/<script src="engine.js\?[^"\s]+"><\/script>/,'<script src="modes/idle/boss-fit.js?v=geometry-2"></script><script src="engine.js?v=rocket-host-1"></script>');
html=html.replace('</body>','<link rel="stylesheet" href="modes/rocket/host.css?v=5"><script src="modes/rocket/host.js?v=3"></script></body>');
if(html.includes('storage-bootstrap.js')||/src="https?:/.test(html)||html.includes('oak-chess.github.io/oakchess/'))throw Error('Rocket shell contains a forbidden entry or external navigation');
fs.writeFileSync(path.join(root,'modes/rocket/index.html'),html);console.log('Built local Rocket TFT shell ('+Buffer.byteLength(html)+' bytes)');
