import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root = process.cwd();
const prefix = root + path.sep;
const archive = path.resolve(root, 'archive/image-assets-before-astro');
const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const entries = JSON.parse(fs.readFileSync('artifacts/image-optimization/migration-sources.json', 'utf8'));
const changed = entries.filter(entry => entry.source.startsWith('public/') && (!fs.existsSync(entry.source) || digest(entry.source) !== entry.sourceHash));
if (changed.length) throw Error('Source files changed during migration; preserved in public for review: ' + [...new Set(changed.map(entry => entry.source))].join(', '));
const sources = ['public/images', 'public/Icon', 'public/Logos'].filter(directory => fs.existsSync(directory)).map(directory => ({ source: path.resolve(root, directory), destination: path.resolve(archive, directory) }));
for (const entry of sources) {
  if (!entry.source.startsWith(prefix) || !entry.destination.startsWith(archive + path.sep)) throw Error('Archive path outside intended project folders.');
  if (fs.existsSync(entry.destination)) throw Error('Refusing to overwrite existing archive: ' + entry.destination);
}
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : entry.isFile() ? [path.join(directory, entry.name)] : []);
const manifest = sources.flatMap(entry => walk(entry.source).map(file => ({ path: path.relative(root, file).replaceAll('\\', '/'), sha256: digest(file) })));
for (const entry of manifest) {
  const destination = path.resolve(archive, entry.path);
  if (!destination.startsWith(archive + path.sep) || fs.existsSync(destination)) throw Error('Invalid or occupied archive destination: ' + destination);
}
// File-by-file moves also work when a development server watches the folders.
for (const entry of manifest) {
  const destination = path.resolve(archive, entry.path);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.renameSync(path.resolve(root, entry.path), destination);
}
for (const entry of manifest) if (digest(path.join(archive, entry.path)) !== entry.sha256) throw Error('Archive verification failed: ' + entry.path);
fs.writeFileSync(path.join(archive, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('Archived ' + manifest.length + ' former public image files with matching hashes. Active masters are in src/assets/images.');
