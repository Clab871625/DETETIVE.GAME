import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8' };

createServer(async (request, response) => {
  try {
    const name = request.url === '/' ? 'index.html' : request.url.slice(1).split('?')[0];
    const body = await readFile(join(root, name));
    response.writeHead(200, { 'Content-Type': types[extname(name)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(4173, '127.0.0.1');
