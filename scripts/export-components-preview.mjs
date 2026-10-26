// Ejecutar después de npm run build. Genera una muestra HTML independiente.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const dist = resolve('dist');
const types = { '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const assets = new Map();
async function assetData(url) {
  if (!assets.has(url)) {
    const path = resolve(dist, '.' + url);
    if (!path.startsWith(dist + sep)) throw new Error('Recurso fuera de dist: ' + url);
    assets.set(url, readFile(path).then(data => `data:${types[extname(path)] || 'application/octet-stream'};base64,${data.toString('base64')}`));
  }
  return assets.get(url);
}

let html = await readFile(resolve(dist, 'componentes-temporal/index.html'), 'utf8');
for (const match of [...html.matchAll(/<link\b[^>]*href="(\/_astro\/[^\"]+\.css)"[^>]*>/g)]) {
  let css = await readFile(resolve(dist, '.' + match[1]), 'utf8');
  for (const resource of [...css.matchAll(/url\(["']?(\/_astro\/[^"')]+)["']?\)/g)]) {
    css = css.replace(resource[0], `url("${await assetData(resource[1])}")`);
  }
  html = html.replace(match[0], `<style>${css}</style>`);
}
// La imagen principal queda embebida: no depende de dist ni de un servidor.
html = html.replace(/\s(?:srcset|sizes)="[^"]*"/g, '');
for (const match of [...html.matchAll(/\bsrc="(\/_astro\/[^\"]+)"/g)]) {
  html = html.replace(match[0], `src="${await assetData(match[1])}"`);
}
const output = resolve('componentes-temporal.html');
await writeFile(output, html, 'utf8');
console.log(`HTML temporal: ${output} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
