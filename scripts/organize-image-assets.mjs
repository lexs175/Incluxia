import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const output = path.join(root, 'artifacts/image-optimization');
const assets = path.join(root, 'src/assets/images');
const prefix = root + path.sep;
const checked = relative => {
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(prefix)) throw Error('Path outside project: ' + relative);
  return absolute;
};
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const original = {};
for (const name of ['hiring', 'profiles', 'stories', 'jobs']) original[name] = fs.readFileSync(checked('src/data/' + name + '.json'), 'utf8');
const hiring = JSON.parse(original.hiring), profiles = JSON.parse(original.profiles), stories = JSON.parse(original.stories);
const entries = [], legacy = {}, avatar = {};
const add = (key, sourceURL, role, provisional = false, bindOld = true, originalFile) => {
  let source = checked(originalFile || 'public' + sourceURL);
  if (!fs.existsSync(source) && !originalFile) {
    const stem = source.replace(/\.[^.]+$/, '');
    const alternatives = ['.png', '.jpg', '.jpeg', '.webp'].map(extension => stem + extension).filter(file => fs.existsSync(file));
    if (alternatives.length === 1) {
      source = alternatives[0];
      key = key.replace(/\.[^.]+$/, path.extname(source));
    }
  }
  if (!fs.existsSync(source)) throw Error('Missing input: ' + source);
  const destination = checked('src/assets/images/' + key);
  if (fs.existsSync(destination)) throw Error('Refusing to overwrite: ' + destination);
  entries.push({ key, source, destination, role, provisional, sourceHash: digest(source) });
  if (bindOld) legacy[sourceURL.replace(/^\/images\//, '')] = key;
  return key;
};
for (const category of hiring.categories) category.image = add(category.image.replace('/images/', ''), category.image, 'category', category.slug !== 'diseno-grafico');
const existingGenerated = new Map();
for (const file of ['artifacts/generated-services/diseno-grafico/v2/manifest.json', 'artifacts/generated-services/sistemas-ti/v1/manifest.json']) {
  if (fs.existsSync(file)) for (const asset of JSON.parse(fs.readFileSync(file, 'utf8')).assets) existingGenerated.set(asset.id, asset);
}
for (const service of hiring.services) {
  const generated = existingGenerated.get(service.id);
  if (service.previewImage) {
    const originalSource = generated?.original && fs.existsSync(generated.original) ? generated.original : undefined;
    const key = service.previewImage.replace('/images/', '').replace(/\.[^.]+$/, originalSource ? path.extname(originalSource) : path.extname(service.previewImage));
    service.previewImage = add(key, service.previewImage, 'service', false, true, originalSource);
  } else {
    const category = hiring.categories.find(category => category.slug === service.categorySlug);
    const sourceURL = '/images/' + category.image;
    const title = service.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    service.previewImage = add('services/' + service.categorySlug + '/' + service.id + '-' + title + path.extname(category.image), sourceURL, 'service', true, false);
    service.previewAlt = 'Imagen provisional del servicio: ' + service.title;
    service.previewProvisional = true;
  }
}
for (const profile of profiles) {
  const source = profile.photo;
  const independent = source.includes('/stories/');
  const key = independent ? 'profiles/' + profile.slug + path.extname(source) : source.replace('/images/', '');
  profile.photo = add(key, source, 'profile', false, !independent);
  if (independent) avatar[source.replace('/images/', '')] = key;
}
const byName = new Map(profiles.map(profile => [profile.name, profile.photo]));
for (const person of hiring.autonomos) person.avatar = byName.get(person.name) || person.avatar;
for (const service of hiring.services) service.author.avatar = byName.get(service.author.name) || service.author.avatar;
for (const story of stories) {
  const source = story.image;
  story.image = add(source.replace('/images/', ''), source, 'story');
}
const hero = {
  primary: { src: add('home/hero/principal.jpg', '/images/home/comunidad-ashico.png', 'hero', true), alt: 'Integrantes de la comunidad ASHICO reunidos al aire libre' },
  secondary: { src: add('home/hero/secundaria.jpg', '/images/hero-ashico-cochabamba.jpg', 'hero', true), alt: '' },
};
const galleryInputs = [
  ['/images/stories/luis-mendoza.png', '01-trabajo-computadora.png', 'Profesional trabajando con una computadora', false],
  ['/images/community/comunidad-ashico-voluntaria.jpg', '02-participacion-ashico.jpg', 'Participación en una actividad de ASHICO', true],
  ['/images/community/comunidad-ashico-triptico.jpg', '03-actividad-ashico.jpg', 'Material de una actividad de ASHICO', true],
  ['/images/stories/maria-rene-morales.png', '04-trabajo-portatil.png', 'Profesional trabajando con su computadora portátil', false],
  ['/images/about/equipo-colaboracion.jpg', '05-colaboracion-trabajo.jpg', 'Personas colaborando en el trabajo', true],
  ['/images/about/vision-trabajo.jpg', '06-jornada-profesional.jpg', 'Una actividad de trabajo en equipo', true],
  ['/images/home/comunidad-ashico.png', '07-encuentro-comunidad.jpg', 'Encuentro de la comunidad ASHICO', false],
  ['/images/about/mision-profesional.jpg', '08-actividad-profesional.jpg', 'Una profesional durante su jornada de trabajo', true],
  ['/images/hero-ashico-cochabamba.jpg', '09-comunidad-cochabamba.jpg', 'Participantes de la comunidad ASHICO en Cochabamba', false],
];
const gallery = galleryInputs.map(([source, file, alt, bindOld]) => ({ src: add('home/gallery/' + file, source, 'gallery', true, bindOld), alt }));
for (const file of ['publicar', 'postulaciones', 'perfil', 'empleos', 'detalle', 'contratar']) add('platform/' + file + '.png', '/images/platform/' + file + '.png', 'screenshot', true);
add('brand/logo.png', '/images/logo.png', 'brand');
for (const file of ['work', 'tasks', 'experience', 'chat']) add('home/' + file + '.svg', '/images/home/' + file + '.svg', 'icon');
for (const file of ['location', 'arrow']) add('offers/' + file + '.svg', '/images/offers/' + file + '.svg', 'icon');
for (const [oldKey, key] of Object.entries({ ...legacy })) if (/\.(png|webp)$/.test(oldKey)) {
  const oldJpg = oldKey.replace(/\.[^.]+$/, '.jpg');
  if (!legacy[oldJpg]) legacy[oldJpg] = key;
}
for (const [oldKey, key] of Object.entries({ ...avatar })) avatar[oldKey.replace(/\.[^.]+$/, '.jpg')] = key;
for (const [key, value] of Object.entries(avatar)) avatar[legacy[key] || key] = value;
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(path.join(output, 'before'), { recursive: true });
for (const [name, text] of Object.entries(original)) fs.writeFileSync(path.join(output, 'before', name + '.json'), text, { flag: 'wx' });
for (const entry of entries) {
  fs.mkdirSync(path.dirname(entry.destination), { recursive: true });
  fs.copyFileSync(entry.source, entry.destination, fs.constants.COPYFILE_EXCL);
  if (digest(entry.destination) !== entry.sourceHash) throw Error('Copy verification failed: ' + entry.key);
}
for (const [name, text] of Object.entries(original)) if (fs.readFileSync(checked('src/data/' + name + '.json'), 'utf8') !== text) throw Error('Concurrent edit in ' + name + '; data not overwritten.');
for (const [name, value] of Object.entries({ hiring, profiles, stories })) fs.writeFileSync(checked('src/data/' + name + '.json'), JSON.stringify(value, null, 2) + '\n');
fs.writeFileSync(checked('src/data/image-aliases.json'), JSON.stringify({ legacy, avatar }, null, 2) + '\n', { flag: 'wx' });
fs.writeFileSync(checked('src/data/image-slots.json'), JSON.stringify({ home: { hero, gallery: [[gallery[0]], gallery.slice(1, 3), [gallery[3]], gallery.slice(4, 6), [gallery[6]], gallery.slice(7, 9)] }, assets: entries.map(({ key, role, provisional }) => ({ key, role, provisional })) }, null, 2) + '\n', { flag: 'wx' });
fs.writeFileSync(path.join(output, 'migration-sources.json'), JSON.stringify(entries.map(({ key, source, sourceHash, role, provisional }) => ({ key, source: path.relative(root, source).replaceAll('\\', '/'), sourceHash, role, provisional })), null, 2));
console.log(JSON.stringify({ slots: entries.length, services: hiring.services.length, existingServiceImagesKept: existingGenerated.size, provisionalServiceCopies: hiring.services.filter(service => service.previewProvisional).length, profiles: profiles.length, independentGallerySlots: gallery.length, heroSlots: 2 }, null, 2));
