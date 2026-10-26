import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root = process.cwd();
const sourceRoot = String.raw`D:\Download\fotos\serviciso de las catergorias`;
const output = path.dirname(fileURLToPath(import.meta.url));
const assetRoot = path.resolve(root, 'src/assets/images');
const hiringFile = path.resolve(root, 'src/data/hiring.json');
const slotsFile = path.resolve(root, 'src/data/image-slots.json');
const hiringBefore = await fs.readFile(hiringFile, 'utf8');
const slotsBefore = await fs.readFile(slotsFile, 'utf8');
const hiring = JSON.parse(hiringBefore);
const slots = JSON.parse(slotsBefore);
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const exists = file => fs.access(file).then(() => true, () => false);
assert.equal(await exists(path.join(output, 'manifest.json')), false, 'This import already ran; inspect its manifest before replacing images again.');

// Keep each numbered group in its category, matching the actual service within it.
const assignments = [
  [1, 'serv-9', 'Revisión de extractos bancarios y registros contables en una oficina'],
  [2, 'serv-10', 'Registro de una factura electrónica SIAT en una computadora portátil'],
  [4, 'serv-11', 'Organización de documentos de compras y ventas para el libro IVA'],
  [3, 'serv-12', 'Preparación de una planilla de sueldos con documentos y una hoja de cálculo'],
  [5, 'serv-13', 'Digitación de formularios y documentos en una computadora'],
  [6, 'serv-14', 'Revisión y limpieza de registros en una hoja de cálculo'],
  [7, 'serv-15', 'Escaneo de documentos físicos para su archivo digital'],
  [8, 'serv-16', 'Registro del inventario de un almacén con un lector de códigos'],
  [10, 'serv-17', 'Gestión de publicaciones en redes sociales desde una computadora portátil'],
  [9, 'serv-18', 'Planificación de un calendario editorial con notas y una computadora portátil'],
  [12, 'serv-19', 'Diseño de un carrusel educativo para redes sociales en un monitor'],
  [11, 'serv-20', 'Atención de mensajes por WhatsApp en una computadora y un teléfono'],
  [13, 'serv-21', 'Revisión de una página web en una computadora portátil y un teléfono'],
  [14, 'serv-22', 'Edición de un sitio web desde el panel de WordPress'],
  [15, 'serv-23', 'Revisión de métricas de rendimiento y accesibilidad de una página web'],
  [16, 'serv-24', 'Maquetación de una página web con el diseño y el código en dos monitores'],
  [19, 'serv-25', 'Ilustración vectorial de un personaje de ave en una tableta gráfica'],
  [17, 'serv-26', 'Diseño de una cuadrícula de iconos vectoriales para interfaces'],
  [18, 'serv-27', 'Revisión de una infografía educativa impresa'],
  [20, 'serv-28', 'Diseño de stickers ilustrados en una tableta gráfica'],
  [21, 'serv-29', 'Edición de un video vertical con subtítulos y una línea de tiempo'],
  [22, 'serv-30', 'Sincronización de subtítulos de una entrevista en un editor de video'],
  [23, 'serv-31', 'Montaje de una entrevista con varias pistas en un editor de video'],
  [24, 'serv-32', 'Animación de textos e ilustraciones para un video promocional'],
];
const received = (await fs.readdir(sourceRoot)).filter(name => /-\d+\.png$/i.test(name));
assert.equal(received.length, 24);
assert.equal(new Set(assignments.map(([number]) => number)).size, 24);
assert.equal(new Set(assignments.map(([, id]) => id)).size, 24);
const planned = [];
for (const [number, id, alt] of assignments) {
  const matches = received.filter(name => new RegExp('-' + number + '\\.png$', 'i').test(name));
  assert.equal(matches.length, 1, 'Missing or duplicate received image ' + number);
  const service = hiring.services.find(service => service.id === id);
  assert.ok(service, id);
  const expectedCategory = hiring.categories[Math.floor((number - 1) / 4) + 2].slug;
  assert.equal(service.categorySlug, expectedCategory, 'Numbered category mismatch for ' + id);
  assert.equal(service.previewProvisional, true, 'Refusing to replace a non-provisional service image: ' + id);
  const asset = slots.assets.find(asset => asset.key === service.previewImage);
  assert.equal(asset?.role, 'service');
  const target = path.resolve(assetRoot, service.previewImage);
  assert.ok(target.startsWith(assetRoot + path.sep));
  assert.equal(path.extname(target), '.webp');
  const source = path.join(sourceRoot, matches[0]);
  const sourceBytes = await fs.readFile(source);
  const sourceMetadata = await sharp(sourceBytes).metadata();
  const encoded = await sharp(sourceBytes).webp({ lossless: true, effort: 6 }).toBuffer();
  const sourcePixels = await sharp(sourceBytes).ensureAlpha().raw().toBuffer();
  const encodedPixels = await sharp(encoded).ensureAlpha().raw().toBuffer();
  assert.equal(hash(sourcePixels), hash(encodedPixels), 'Lossless conversion changed pixels: ' + matches[0]);
  planned.push({ number, service, asset, alt, source, sourceBytes, target, encoded, before: await fs.readFile(target), width: sourceMetadata.width, height: sourceMetadata.height });
}

// Finish all validation and encoding before touching active files.
assert.equal(await fs.readFile(hiringFile, 'utf8'), hiringBefore, 'Hiring data changed during preparation.');
assert.equal(await fs.readFile(slotsFile, 'utf8'), slotsBefore, 'Image slots changed during preparation.');
await fs.mkdir(path.join(output, 'originals'), { recursive: true });
await fs.mkdir(path.join(output, 'previous'), { recursive: true });
await fs.writeFile(path.join(output, 'hiring.before.json'), hiringBefore, { flag: 'wx' });
await fs.writeFile(path.join(output, 'image-slots.before.json'), slotsBefore, { flag: 'wx' });
const manifest = [];
for (const item of planned) {
  const { number, service, asset, alt, source, sourceBytes, target, encoded, before, width, height } = item;
  const originalCopy = path.join(output, 'originals', path.basename(source));
  const previousCopy = path.join(output, 'previous', path.basename(target));
  await fs.writeFile(originalCopy, sourceBytes, { flag: 'wx' });
  await fs.writeFile(previousCopy, before, { flag: 'wx' });
  assert.equal(hash(await fs.readFile(source)), hash(sourceBytes), 'Received original changed: ' + source);
  assert.equal(hash(await fs.readFile(target)), hash(before), 'Target changed during preparation: ' + target);
  await fs.writeFile(target, encoded);
  service.previewProvisional = false;
  service.previewAlt = alt;
  asset.provisional = false;
  assert.equal(hash(await fs.readFile(target)), hash(encoded));
  manifest.push({ number, serviceId: service.id, title: service.title, category: service.categorySlug, source, target: service.previewImage, originalCopy: path.relative(root, originalCopy), previousCopy: path.relative(root, previousCopy), sourceSha256: hash(sourceBytes), previousSha256: hash(before), targetSha256: hash(encoded), sourceBytes: sourceBytes.length, targetBytes: encoded.length, width, height, pixelsPreserved: true, alt });
}
assert.equal(await fs.readFile(hiringFile, 'utf8'), hiringBefore, 'Hiring data changed before saving.');
assert.equal(await fs.readFile(slotsFile, 'utf8'), slotsBefore, 'Image slots changed before saving.');
await fs.writeFile(hiringFile, JSON.stringify(hiring, null, 2) + '\n');
await fs.writeFile(slotsFile, JSON.stringify(slots, null, 2) + '\n');
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ installed: manifest.length, uniqueTargets: new Set(manifest.map(item => item.target)).size, originalsUntouched: true, pixelsPreserved: manifest.every(item => item.pixelsPreserved), assignments: manifest.map(({ number, serviceId, title }) => ({ number, serviceId, title })) }, null, 2));
