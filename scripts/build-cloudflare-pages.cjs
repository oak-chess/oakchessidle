const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, '_cloudflare');
const spritePrefix = 'assets/pmd/sprite/';
const entryFiles = new Set(['index.html', 'engine.js', 'asset-inventory.js', 'layout.css', 'transfer.html', 'CREDITS.md']);
const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
  .split('\0').filter(Boolean);
const modified = new Set(execFileSync('git', ['diff', 'HEAD', '--name-only', '-z'], {
  cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024
}).split('\0').filter(Boolean));
const files = tracked.filter(file =>
  !file.startsWith(spritePrefix) && !file.startsWith('modes/idle/online/') &&
  (entryFiles.has(file) || /^(assets|wallpapers|modes)\//.test(file))
);
if (files.length + 2 > 20000) throw new Error('Cloudflare Pages file limit exceeded');
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
fs.copyFileSync(path.join(__dirname, 'cloudflare-sprites-worker.mjs'), path.join(output, '_worker.js'));
fs.writeFileSync(path.join(output, '_routes.json'), JSON.stringify({
  version: 1, include: ['/' + spritePrefix + '*'], exclude: []
}) + '\n');
console.log('Prepared ' + files.length + ' static game files in _cloudflare');
