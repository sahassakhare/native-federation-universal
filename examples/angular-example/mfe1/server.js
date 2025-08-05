import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 4201;
const DIST_DIR = join(__dirname, 'dist');

const mimeTypes = {
 '.html': 'text/html',
 '.js': 'text/javascript',
 '.css': 'text/css',
 '.json': 'application/json',
 '.png': 'image/png',
 '.jpg': 'image/jpeg',
 '.gif': 'image/gif',
 '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
 let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

 if (!existsSync(filePath)) {
 filePath = join(DIST_DIR, 'index.html'); // SPA fallback
 }

 try {
 const content = readFileSync(filePath);
 const ext = extname(filePath);
 const mimeType = mimeTypes[ext] || 'text/plain';

 res.writeHead(200, {
 'Content-Type': mimeType,
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
 'Access-Control-Allow-Headers': 'Content-Type'
 });
 res.end(content);
 } catch (error) {
 res.writeHead(404, { 'Content-Type': 'text/plain' });
 res.end('Not Found');
 }
});

server.listen(PORT, '127.0.0.1', () => {
 console.log(` MFE1 running at http://127.0.0.1:${PORT}`);
 console.log(` Serving from: ${DIST_DIR}`);
 console.log(` Remote entry: http://127.0.0.1:${PORT}/remoteEntry.js`);
 console.log('Press Ctrl+C to stop the server');
});

process.on('SIGINT', () => {
 console.log('\n Stopping MFE1 server...');
 server.close();
 process.exit(0);
});