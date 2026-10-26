import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const root = process.cwd();
const work = path.join(root, 'artifacts/generated-services/diseno-grafico/v2');
const source = JSON.parse(fs.readFileSync(path.join(work, 'sources.json'), 'utf8'));
const assets = path.join(root, 'public/images/services/diseno-grafico');
const originals = path.join(work, 'originals');
fs.mkdirSync(assets, { recursive: true });
fs.mkdirSync(originals, { recursive: true });
const targets = source.images.map(item => ({ ...item, original: path.join(originals, item.slug + '-v2.png'), output: path.join(assets, item.slug + '-v2.webp'), url: '/images/services/diseno-grafico/' + item.slug + '-v2.webp' }));
for (const item of targets) {
  if (!item.sourcePath || !fs.existsSync(item.sourcePath)) throw new Error('Missing generated source for ' + item.id);
  if (fs.existsSync(item.original) || fs.existsSync(item.output)) throw new Error('Refusing to overwrite existing output: ' + item.id);
}
fs.writeFileSync(path.join(work, 'hiring-before.json'), fs.readFileSync(path.join(root, 'src/data/hiring.json')), { flag: 'wx' });
const manifest = [];
for (const item of targets) {
  fs.copyFileSync(item.sourcePath, item.original, fs.constants.COPYFILE_EXCL);
  await sharp(item.original).webp({ quality: 88, effort: 6 }).toFile(item.output);
  const metadata = await sharp(item.output).metadata();
  manifest.push({ id: item.id, title: item.title, url: item.url, original: path.relative(root, item.original).replaceAll('\\', '/'), width: metadata.width, height: metadata.height, bytes: fs.statSync(item.output).size, sha256: crypto.createHash('sha256').update(fs.readFileSync(item.output)).digest('hex'), sourcePath: item.sourcePath });
}
fs.writeFileSync(path.join(work, 'manifest.json'), JSON.stringify({ generatedWith: 'image_gen built-in', assets: manifest }, null, 2));
console.log(JSON.stringify(manifest.map(({id,url,width,height,bytes}) => ({id,url,width,height,kb:Math.round(bytes/1024)})), null, 2));
