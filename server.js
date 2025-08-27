// Simple static server for local testing
// Usage: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.join(__dirname);

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (fs.existsSync(path.join(ROOT, urlPath)) && fs.statSync(path.join(ROOT, urlPath)).isDirectory()) {
    res.writeHead(301, { Location: urlPath + '/' });
    res.end();
    return;
  }
  let filePath;
  // Rewrite /js/ and /assets/ to /1.7/js/ and /assets/
  if (urlPath.startsWith('/js/')) {
    filePath = path.join(ROOT, '1.7', urlPath);
  } else if (urlPath.startsWith('/assets/')) {
    filePath = path.join(ROOT, urlPath);
  } else if (urlPath === '/' || urlPath === '') {
    filePath = path.join(ROOT, '1.7', '1.6.6.html');
  } else if (urlPath.startsWith('/1.7/')) {
    filePath = path.join(ROOT, urlPath);
  } else {
    // Default: try to serve from /1.7/ for relative paths
    filePath = path.join(ROOT, '1.7', urlPath);
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
