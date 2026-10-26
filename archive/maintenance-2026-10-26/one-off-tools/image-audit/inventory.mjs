import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const output = path.join(root, 'artifacts/image-audit');
fs.mkdirSync(output, { recursive: true });
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const source = walk(path.join(root, 'src')).filter(file => /\.(astro|css|ts|json)$/.test(file)).map(file => ({ file: path.relative(root, file).replaceAll('\\', '/'), text: fs.readFileSync(file, 'utf8') }));
const assets = [];
for (const file of walk(path.join(root, 'public/images')).filter(file => /\.(png|webp|jpe?g)$/i.test(file))) {
  const bytes = fs.readFileSync(file);
  const meta = await sharp(bytes).metadata();
  const url = '/' + path.relative(path.join(root, 'public'), file).replaceAll('\\', '/');
  assets.push({ url, format: meta.format, width: meta.width, height: meta.height, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), uses: source.filter(entry => entry.text.includes(url)).map(entry => entry.file), metadataFields: Object.keys(meta).filter(key => ['exif', 'iptc', 'xmp', 'comments'].includes(key)), metadataText: [meta.exif, meta.iptc, meta.xmp].filter(Boolean).map(b => b.toString('utf8').replace(/[^\x20-\x7e\n]/g, ' ').replace(/ +/g, ' ').slice(0, 1600)) });
}
const duplicateGroups = Object.values(Object.groupBy(assets, item => item.sha256)).filter(group => group.length > 1).map(group => group.map(item => item.url));
fs.writeFileSync(path.join(output, 'codex-inventory.json'), JSON.stringify({ generatedAt: new Date().toISOString(), rasterFiles: assets.length, uniqueRasterContents: new Set(assets.map(item => item.sha256)).size, duplicateGroups, assets }, null, 2));
const groups = {
  personas: assets.filter(item => /\/profiles\/|\/stories\//.test(item.url)),
  contenido: assets.filter(item => /\/about\/|\/blog\/|\/community\/|\/categories\/|\/home\/|\/hero-|\/trabajo/.test(item.url)),
};
const esc = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
for (const [name, group] of Object.entries(groups)) {
  const columns = 4, cellWidth = 320, cellHeight = 254;
  const tiles = [];
  for (let index = 0; index < group.length; index++) {
    const item = group[index];
    const thumb = await sharp(path.join(root, 'public', item.url.slice(1))).rotate().resize(300, 198, { fit: 'contain', background: '#ececec' }).png().toBuffer();
    const label = Buffer.from(`<svg width="320" height="46"><rect width="320" height="46" fill="white"/><text x="10" y="17" font-family="Arial" font-size="13">${esc(item.url.split('/').at(-1))}</text><text x="10" y="36" font-family="Arial" font-size="12">${item.width} × ${item.height} · ${Math.round(item.bytes / 1024)} KB</text></svg>`);
    const left = index % columns * cellWidth, top = Math.floor(index / columns) * cellHeight;
    tiles.push({ input: thumb, left: left + 10, top: top + 6 }, { input: label, left, top: top + 204 });
  }
  await sharp({ create: { width: columns * cellWidth, height: Math.ceil(group.length / columns) * cellHeight, channels: 3, background: '#dedede' } }).composite(tiles).png().toFile(path.join(output, `${name}.png`));
}
console.log(JSON.stringify({ rasterFiles: assets.length, uniqueRasterContents: new Set(assets.map(item => item.sha256)).size, duplicateGroups, noLiteralReferences: assets.filter(item => !item.uses.length).map(item => item.url), metadata: assets.filter(item => item.metadataFields.length).map(item => ({ url: item.url, fields: item.metadataFields, text: item.metadataText })) }, null, 2));
