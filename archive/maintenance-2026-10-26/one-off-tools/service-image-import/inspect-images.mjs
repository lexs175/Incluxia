import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = String.raw`D:\Download\fotos\serviciso de las catergorias`;
const output = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/i, '$1'));
const files = (await fs.readdir(source)).filter(name => /-\d+\.png$/i.test(name)).sort((a, b) => Number(a.match(/-(\d+)\.png$/i)[1]) - Number(b.match(/-(\d+)\.png$/i)[1]));
const metadata = [];
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
for (let start = 0; start < files.length; start += 12) {
  const layers = [];
  for (let index = start; index < Math.min(start + 12, files.length); index++) {
    const name = files[index];
    const file = path.join(source, name);
    const { width, height, format } = await sharp(file).metadata();
    metadata.push({ name, width, height, format });
    const position = index - start;
    const left = (position % 4) * 360;
    const top = Math.floor(position / 4) * 192;
    layers.push({ input: await sharp(file).resize(360, 150, { fit: 'contain', background: 'white' }).png().toBuffer(), left, top });
    const label = name.replace(/\.png$/i, '');
    const number = name.match(/-(\d+)\.png$/i)[1];
    layers.push({ input: Buffer.from(`<svg width="360" height="42"><rect width="360" height="42" fill="white"/><text x="8" y="16" font-family="Arial" font-size="12" fill="black">${number}. ${escape(label.replace(/-\d+$/, '').slice(0, 47))}</text><text x="8" y="33" font-family="Arial" font-size="10" fill="black">${width} × ${height}</text></svg>`), left, top: top + 150 });
  }
  await sharp({ create: { width: 1440, height: 576, channels: 3, background: 'white' } }).composite(layers).png().toFile(path.join(output, `contact-${start + 1}-${Math.min(start + 12, files.length)}.png`));
}
await fs.writeFile(path.join(output, 'received-images.json'), JSON.stringify(metadata, null, 2) + '\n');
console.log(JSON.stringify(metadata));
