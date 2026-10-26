import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const root = process.cwd();
const receivedRoot = String.raw`D:\Download\fotos\home`;
const assetRoot = path.resolve('src/assets/images');
const output = path.dirname(fileURLToPath(import.meta.url));
const archiveRoot = path.resolve('archive/home-images-before-2026-10-26');
const slotsFile = path.resolve('src/data/image-slots.json');
const aliasesFile = path.resolve('src/data/image-aliases.json');
const beforeSlots = await fs.readFile(slotsFile, 'utf8');
const beforeAliases = await fs.readFile(aliasesFile, 'utf8');
const slots = JSON.parse(beforeSlots);
const aliases = JSON.parse(beforeAliases);
const gallery = slots.home.gallery.flat();
const exists = file => fs.access(file).then(() => true, () => false);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
assert.equal(await exists(path.join(output, 'manifest.json')), false, 'The home import has already run.');
assert.equal(await exists(archiveRoot), false, 'Archive already exists; inspect it before importing again.');
const names = (await fs.readdir(receivedRoot)).filter(name => /\.png$/i.test(name));
assert.equal(names.length, 10);
const numbered = number => {
  const found = names.filter(name => new RegExp('-' + number + '\\.png$', 'i').test(name));
  assert.equal(found.length, 1, 'Missing/duplicate image ' + number);
  return found[0];
};
const group = names.filter(name => !/-\d+\.png$/i.test(name));
assert.equal(group.length, 1);
const assignments = [
  { slot: 'hero-primary', image: slots.home.hero.primary, file: numbered(1), key: 'home/hero/principal.png', alt: 'Mujer cosiendo una prenda en una máquina de coser dentro de un taller' },
  { slot: 'hero-secondary', image: slots.home.hero.secondary, file: group[0], key: 'home/hero/secundaria.png', alt: 'Personas reunidas al aire libre en un encuentro comunitario' },
  { slot: 'gallery-1', image: gallery[0], file: numbered(2), key: 'home/gallery/01-trabajo-computadora.png', alt: 'Hombre trabajando frente a una computadora en un espacio compartido' },
  { slot: 'gallery-2', image: gallery[1], file: numbered(8), key: 'home/gallery/02-plantines-equipo.png', alt: 'Dos personas trasplantando plantines en un espacio de trabajo' },
  { slot: 'gallery-4', image: gallery[3], file: numbered(3), key: 'home/gallery/04-reparacion-madera.png', alt: 'Mujer reparando una silla de madera en un taller' },
  { slot: 'gallery-5', image: gallery[4], file: numbered(4), key: 'home/gallery/05-colaboracion-trabajo.png', alt: 'Dos personas montando una estantería de madera' },
  { slot: 'gallery-6', image: gallery[5], file: numbered(5), key: 'home/gallery/06-diseno-grafico.png', alt: 'Diseñadora trabajando con muestras de color y una computadora portátil' },
  { slot: 'gallery-7', image: gallery[6], file: numbered(6), key: 'home/gallery/07-emprendimiento-reposteria.png', alt: 'Emprendedora preparando pedidos de repostería' },
  { slot: 'gallery-8', image: gallery[7], file: numbered(9), key: 'home/gallery/08-inventario-archivo.png', alt: 'Persona revisando carpetas y registros en una oficina' },
  { slot: 'gallery-9', image: gallery[8], file: numbered(7), key: 'home/gallery/09-taller-informatica.png', alt: 'Personas participando en un taller de informática' },
];
assert.equal(new Set(assignments.map(item => item.file)).size, 10);
assert.equal(new Set(assignments.map(item => item.key)).size, 10);
const plan = [];
for (const item of assignments) {
  const oldKey = item.image.src;
  const source = path.join(receivedRoot, item.file);
  const target = path.resolve(assetRoot, item.key);
  const previous = path.resolve(assetRoot, oldKey);
  const archived = path.resolve(archiveRoot, oldKey);
  assert.ok(target.startsWith(assetRoot + path.sep));
  assert.ok(previous.startsWith(assetRoot + path.sep));
  assert.ok(archived.startsWith(archiveRoot + path.sep));
  if (previous !== target) assert.equal(await exists(target), false, 'New target already exists: ' + target);
  const asset = slots.assets.find(asset => asset.key === oldKey);
  assert.ok(asset && ['hero', 'gallery'].includes(asset.role));
  const bytes = await fs.readFile(source);
  const metadata = await sharp(bytes).metadata();
  assert.equal(metadata.format, 'png');
  plan.push({ ...item, oldKey, source, target, previous, archived, bytes, before: await fs.readFile(previous), asset, width: metadata.width, height: metadata.height });
}
assert.equal(await fs.readFile(slotsFile, 'utf8'), beforeSlots, 'Image slots changed during preparation.');
assert.equal(await fs.readFile(aliasesFile, 'utf8'), beforeAliases, 'Aliases changed during preparation.');
await fs.mkdir(archiveRoot, { recursive: true });
await fs.writeFile(path.join(archiveRoot, 'image-slots.before.json'), beforeSlots, { flag: 'wx' });
await fs.writeFile(path.join(archiveRoot, 'image-aliases.before.json'), beforeAliases, { flag: 'wx' });
const manifest = [];
for (const item of plan) {
  const { slot, image, file, key, alt, oldKey, source, target, previous, archived, bytes, before, asset, width, height } = item;
  assert.equal(hash(await fs.readFile(previous)), hash(before), 'Active source changed: ' + oldKey);
  await fs.mkdir(path.dirname(archived), { recursive: true });
  await fs.writeFile(archived, before, { flag: 'wx' });
  assert.equal(hash(await fs.readFile(archived)), hash(before));
  await fs.writeFile(target, bytes);
  assert.equal(hash(await fs.readFile(target)), hash(bytes));
  assert.equal(hash(await fs.readFile(source)), hash(bytes), 'Received original changed.');
  image.src = key;
  image.alt = alt;
  asset.key = key;
  asset.provisional = false;
  for (const [legacy, destination] of Object.entries(aliases.legacy)) {
    if (destination === oldKey) aliases.legacy[legacy] = key;
  }
  aliases.legacy[oldKey] = key;
  manifest.push({ slot, received: file, source, target: key, previous: oldKey, archive: path.relative(root, archived), width, height, bytes: bytes.length, sha256: hash(bytes), previousSha256: hash(before), alt });
}
gallery[2].alt = 'Mujer sosteniendo material de ASHICO durante una actividad';
slots.assets.find(asset => asset.key === gallery[2].src).provisional = false;
assert.equal(new Set([...Object.values(slots.home.hero), ...gallery].map(image => image.src)).size, 11);
assert.equal(await fs.readFile(slotsFile, 'utf8'), beforeSlots, 'Image slots changed before saving.');
assert.equal(await fs.readFile(aliasesFile, 'utf8'), beforeAliases, 'Aliases changed before saving.');
await fs.writeFile(slotsFile, JSON.stringify(slots, null, 2) + '\n');
await fs.writeFile(aliasesFile, JSON.stringify(aliases, null, 2) + '\n');
// Retire obsolete masters only after the new files and references exist.
for (const item of plan) {
  if (item.previous !== item.target) {
    assert.equal(hash(await fs.readFile(item.previous)), hash(item.before));
    assert.equal(hash(await fs.readFile(item.archived)), hash(item.before));
    await fs.unlink(item.previous);
  }
}
await fs.writeFile(path.join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await fs.writeFile(path.join(archiveRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify({ installed: manifest.length, preserved: gallery[2].src, receivedOriginalsUntouched: true, nativePngBytesPreserved: true, assignments: manifest.map(({ slot, received, target }) => ({ slot, received, target })) }, null, 2));
