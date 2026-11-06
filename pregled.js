/* Lokalni pregled: `node pregled.js` → http://localhost:8095 (strane rade i duplim klikom). */
const http = require('http'), fs = require('fs'), path = require('path');
const TIP = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
http.createServer((q, o) => {
  let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  const f = path.join(__dirname, path.normalize(p).replace(/^([.][.][\/\\])+/, ''));
  fs.readFile(f, (g, d) => { if (g) { o.writeHead(404); return o.end('nema'); } o.writeHead(200, { 'Content-Type': TIP[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); o.end(d); });
}).listen(8095, () => console.log('http://localhost:8095'));
