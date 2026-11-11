const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '_cloudflare');
const spritePrefix = 'assets/pmd/sprite/';
const onlineFiles = new Set(['index.html', 'config.js', 'online.js', 'chat-client.mjs', 'hunt-client.mjs',
  'home.html', 'home.css', 'home.js', 'contacts-ui.mjs', 'chat.css', 'private-chat.mjs', 'verification.mjs', 'new-conversation.mjs', 'game-entry.html', 'game-entry.js']);
const entryFiles = new Set(['index.html', 'engine.js', 'asset-inventory.js', 'layout.css', 'transfer.html', 'CREDITS.md']);
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  .split('\0').filter(Boolean);
const modified = new Set(execFileSync('git', ['diff', 'HEAD', '--name-only', '-z'], {
  cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
}).split('\0').filter(Boolean));
const files = tracked.filter(file =>
  !file.startsWith(spritePrefix) &&
  (!file.startsWith('modes/idle/online/') || onlineFiles.has(file.slice('modes/idle/online/'.length))) &&
  (entryFiles.has(file) || /^(assets|wallpapers|modes)\//.test(file))
);
if (files.length + 5 > 20000) throw new Error('Cloudflare Pages file limit exceeded');
for (const file of files) {
  if (fs.statSync(path.join(root, file)).size > 25 * 1024 * 1024) {
    throw new Error('Cloudflare Pages asset size limit exceeded: ' + file);
  }
}
if (fs.existsSync(output)) throw new Error('Remove the previous _cloudflare build before rebuilding');
for (const file of files) {
  const target = path.join(output, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  if (modified.has(file)) {
    fs.writeFileSync(target, execFileSync('git', ['show', 'HEAD:' + file], {
      cwd: root, maxBuffer: 32 * 1024 * 1024
    }));
  } else {
    fs.copyFileSync(path.join(root, file), target);
  }
}
fs.copyFileSync(path.join(output, 'index.html'), path.join(output, 'game-shell.txt'));
fs.copyFileSync(path.join(output, 'modes/idle/online/game-entry.html'), path.join(output, 'game.html'));
// The legacy entry must use the same gate, never expose a playable anonymous page.
fs.copyFileSync(path.join(output, 'modes/idle/online/game-entry.html'), path.join(output, 'modes/idle/index.html'));
fs.copyFileSync(path.join(output, 'modes/idle/online/home.html'), path.join(output, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'cloudflare-sprites-worker.mjs'), path.join(output, '_worker.js'));
fs.writeFileSync(path.join(output, '_headers'), '/game-shell.txt\n  Content-Type: text/plain; charset=utf-8\n  X-Content-Type-Options: nosniff\n  Cache-Control: no-store\n/game\n  Cache-Control: no-store\n/game.html\n  Cache-Control: no-store\n');
fs.writeFileSync(path.join(output, '_routes.json'), JSON.stringify({
  version: 1, include: ['/' + spritePrefix + '*'], exclude: []
}) + '\n');
console.log('Prepared ' + files.length + ' static game files in _cloudflare');
