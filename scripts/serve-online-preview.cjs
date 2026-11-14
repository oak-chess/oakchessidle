// Preview the working tree with the same login gate as Cloudflare, without publishing.
const http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.OAK_PREVIEW_PORT||8798);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8',
 '.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml',
 '.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.xml':'application/xml','.woff':'font/woff','.woff2':'font/woff2',
 '.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav','.mp4':'video/mp4','.ico':'image/x-icon'};
http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
  let file=pathname.slice(1),type;
  if(['','index.html'].includes(file))file='modes/idle/online/home.html';
  else if(['game','game.html','modes/idle/index.html'].includes(file))file='modes/idle/online/game-entry.html';
  else if(file==='game-shell.txt'){file='index.html';type='text/plain; charset=utf-8';}
  else if(file==='game-version.json'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({release:'local-preview'}));return;}
  const target=path.resolve(root,file),ext=path.extname(file).toLowerCase();
  const publicFile=/^(assets|wallpapers|modes)\//.test(file)||['index.html','engine.js','asset-inventory.js','layout.css'].includes(file);
  if(!publicFile||!target.startsWith(root+path.sep)||!mime[ext]||file.includes('..')||file.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end();return;}
  const content=await fs.readFile(target);res.setHeader('Content-Type',type||mime[ext]);res.writeHead(200);res.end(req.method==='HEAD'?undefined:content);
 }catch{res.writeHead(404).end();}
}).listen(port,'127.0.0.1',()=>console.log('Prévia online local: http://127.0.0.1:'+port+'/'));
