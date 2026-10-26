import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
if (fs.readFileSync(path.join(root, 'src/lib/hiring.ts'), 'utf8').includes('import { setImage }')) throw Error('Image migration already connected; do not run this one-time migration twice.');
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const backup = path.join(root, 'artifacts/image-optimization/source-before');
const write = (file, text) => {
  const original = fs.readFileSync(file, 'utf8');
  if (original === text) return;
  const destination = path.join(backup, path.relative(root, file));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (!fs.existsSync(destination)) fs.copyFileSync(file, destination);
  fs.writeFileSync(file, text);
};
let count = 0;
for (const file of walk(path.join(root, 'src')).filter(file => file.endsWith('.astro') && !file.endsWith('SiteImage.astro'))) {
  let text = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (relative.endsWith('/Header.astro')) text = text.replace(/<!--\s*<img[\s\S]*?-->/g, '');
  if (relative.endsWith('/HomeHero.astro')) {
    text = text.replace('---\n', '---\nimport imageSlots from "../../data/image-slots.json";\n').replace('---\r\n', '---\r\nimport imageSlots from "../../data/image-slots.json";\r\n');
    let index = 0;
    text = text.replace(/src="\/images\/home\/comunidad-ashico.png"/g, () => 'src={imageSlots.home.hero.' + (index++ === 0 ? 'primary' : 'secondary') + '.src}');
  }
  if (relative.endsWith('/HomeCommunity.astro')) {
    text = text.replace(/const columns = \[[\s\S]*?\r?\n\];/, 'const columns = imageSlots.home.gallery;');
    text = text.replace(/^(---\r?\n)/, '$1import imageSlots from "../../data/image-slots.json";\n');
  }
  if (relative.endsWith('/HomeGuide.astro')) {
    text = text.replace(/^(---\r?\n)/, '$1import { optimizedImage } from "../../lib/images.server";\n');
    const frontEnd = text.indexOf('---', 3);
    text = text.slice(0, frontEnd) + 'const preparedImages = await Promise.all(images.map(async (image, index) => ({ ...image, full: (await optimizedImage(image.src, "screenshot")).src, kind: layout === "split" && index === 0 ? "screenshotSplit" as const : "screenshot" as const })));\n' + text.slice(frontEnd);
    text = text.replace('{images.map(', '{preparedImages.map(').replace('href={image.src}', 'href={image.full}');
  }
  const hadImage = /<img\b/.test(text);
  text = text.replace(/<img\b[\s\S]*?\/>/g, tag => {
    count++;
    let kind = 'detail', extra = '';
    if (/ProfileCard\.astro$/.test(file)) kind = 'portrait';
    if (/StoryCard\.astro$/.test(file)) kind = 'storyCard';
    if (/CategoryCard\.astro$/.test(file)) kind = 'category';
    if (/AutonomoCard\.astro$/.test(file)) { kind = 'avatar'; extra = ' sizes="48px"'; }
    if (/ServiceCard\.astro$/.test(file)) { kind = tag.includes('service-author-avatar') ? 'avatar' : 'service'; if (kind === 'avatar') extra = ' sizes="32px"'; }
    if (/HiringDrawer\.astro$/.test(file)) { kind = tag.includes('drawer-service-image') ? 'service' : 'avatar'; extra = kind === 'service' ? ' sizes="min(512px, calc(100vw - 48px))"' : tag.includes('drawer-author-avatar') ? ' sizes="44px"' : ' sizes="100px"'; }
    if (/Header\.astro$/.test(file)) { kind = 'avatar'; extra = tag.includes('headerProfileImg') ? ' sizes="38px"' : ' sizes="42px"'; }
    if (/ProfileDetail\.astro$/.test(file)) { kind = 'avatar'; extra = ' sizes="128px"'; }
    if (/OfferCard\.astro$/.test(file) && tag.includes('publisher-photo')) { kind = 'avatar'; extra = ' sizes="40px"'; }
    if (/HomeHero\.astro$/.test(file)) { kind = tag.includes('.primary.') ? 'hero' : 'heroSecondary'; if (kind === 'hero') extra = ' priority'; }
    if (/HomeCommunity\.astro$/.test(file)) return tag.replace('<img', '<SiteImage kind={column.length === 1 ? "galleryTall" : "gallery"}');
    if (/HomeGuide\.astro$/.test(file)) return tag.replace('<img', '<SiteImage kind={image.kind}');
    if (/StoriesFeaturedShowcase\.astro$/.test(file)) { kind = 'storyFeatured'; extra = ' priority'; }
    if (/YouTubeVideo\.astro$/.test(file)) extra = ' priority';
    return tag.replace('<img', '<SiteImage kind="' + kind + '"' + extra);
  });
  if (hadImage) {
    let importPath = path.relative(path.dirname(file), path.join(root, 'src/components/ui/SiteImage.astro')).replaceAll('\\', '/');
    if (!importPath.startsWith('.')) importPath = './' + importPath;
    text = text.replace(/^(---\r?\n)/, '$1import SiteImage from "' + importPath + '";\n');
  }
  if (/Header\.astro$/.test(file)) {
    text = text.replace(/<script>\r?\n/, '<script>\n  import { setImage } from "../../lib/image-client";\n');
    text = text.replace(/\b(image|mobileImage)\.src\s*=\s*user.photo;/g, 'setImage($1, user.photo);');
  }
  if (relative.endsWith('/ServiceCard.astro')) text = text.replace('Boolean(service.previewImage)', 'Boolean(service.previewImage) && !service.previewProvisional');
  write(file, text);
}
for (const name of ['hiring', 'profile', 'jobs']) {
  const file = path.join(root, 'src/lib/' + name + '.ts');
  let text = fs.readFileSync(file, 'utf8');
  text = 'import { setImage } from "./image-client";\n' + text;
  text = text.replace(/\b(photo|avatar|image|cover)\.src\s*=\s*([^;]+);/g, 'setImage($1, $2);');
  text = text.replace(/\b(photo|image)\.removeAttribute\('src'\)/g, 'setImage($1, undefined)');
  write(file, text);
}
const presentation = path.join(root, 'src/lib/job-presentation.ts');
write(presentation, 'import { isLocalImageKey } from "./image-presets";\n' + fs.readFileSync(presentation, 'utf8').replace('const safeImage = /', 'const safeImage = isLocalImageKey(image) || /'));
console.log('Connected ' + count + ' image placements and the runtime avatar/cover updates.');
