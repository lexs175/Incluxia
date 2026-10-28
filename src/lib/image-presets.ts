import aliases from '../data/image-aliases.json';

export const imagePresets = {
  avatar: { width: 128, widths: [32, 48, 64, 96, 128, 192, 256, 384], ratio: 1, quality: 84, sizes: '48px' },
  profileCover: { width: 1120, widths: [384, 640, 768, 960, 1120, 1440, 1920, 2172], quality: 86, coverageHeight: 'clamp(160px, 18vw, 240px)', sizes: '(max-width: 1120px) calc(100vw - 32px), 1120px' },
  service: { width: 640, widths: [320, 384, 480, 640, 768, 960, 1200, 1600], ratio: 12 / 5, quality: 86, sizes: '(max-width: 680px) calc(100vw - 32px), (max-width: 1024px) calc((100vw - 56px) / 2), (max-width: 1440px) calc((100vw - 402px) / 3), 346px' },
  category: { width: 640, widths: [320, 384, 480, 640, 768, 960, 1200, 1440], quality: 84, coverageHeight: '300px', sizes: '(max-width: 540px) calc(100vw - 32px), (max-width: 860px) calc((100vw - 52px) / 2), (max-width: 1200px) calc((100vw - 88px) / 3), (max-width: 1440px) calc((100vw - 108px) / 4), 333px' },
  portrait: { width: 640, widths: [320, 480, 640, 768, 960, 1200], quality: 85, coverageHeight: '270px', sizes: '(max-width: 767px) calc(100vw - 64px), (max-width: 1024px) calc((100vw - 100px) / 2), 400px' },
  storyCard: { width: 640, widths: [320, 480, 640, 768, 960, 1200], quality: 85, coverageHeight: '220px', sizes: '(max-width: 767px) calc(100vw - 64px), (max-width: 1024px) calc((100vw - 100px) / 2), 420px' },
  storyFeatured: { width: 960, widths: [384, 640, 768, 960, 1200, 1600], quality: 86, coverageHeight: 'clamp(320px, 33vw, 480px)', sizes: '(max-width: 991px) calc(100vw - 32px), (max-width: 1440px) calc((100vw - 96px) / 2), 672px' },
  detail: { width: 1200, widths: [384, 640, 768, 960, 1200, 1600, 1920], quality: 86, sizes: '(max-width: 960px) calc(100vw - 32px), 900px' },
  hero: { width: 1200, widths: [384, 640, 768, 960, 1200, 1600, 1920], quality: 85, coverageHeight: 'clamp(320px, 28vw, 536.4px)', sizes: '(max-width: 479px) calc(100vw - 32px), (max-width: 1440px) calc((100vw - 58px) * 0.6), 829px' },
  heroSecondary: { width: 960, widths: [384, 640, 768, 960, 1200, 1600], quality: 85, coverageHeight: 'clamp(320px, 28vw, 536.4px)', sizes: '(max-width: 1440px) calc((100vw - 58px) * 0.4), 553px' },
  gallery: { width: 480, widths: [160, 240, 320, 480, 640, 960], quality: 84, coverageHeight: 'clamp(144px, 14.896vw, 286px)', sizes: 'clamp(160px, 16.667vw, 320px)' },
  galleryTall: { width: 640, widths: [160, 240, 320, 480, 640, 960, 1280, 1600], quality: 84, coverageHeight: 'clamp(288px, 29.792vw, 572px)', sizes: 'clamp(160px, 16.667vw, 320px)' },
  heroMarquee: { width: 640, widths: [240, 320, 480, 640, 960, 1280, 1600], quality: 85, coverageHeight: 'clamp(240px, 21.3vw, 428px)', sizes: 'clamp(272px, 27.5vw, 528px)' },
  screenshot: { width: 1200, widths: [384, 640, 768, 960, 1200, 1440], quality: 90, sizes: '(max-width: 767px) calc(100vw - 48px), (max-width: 1440px) calc(100vw - 64px), 1376px' },
  screenshotSplit: { width: 960, widths: [384, 640, 768, 960, 1200, 1440], quality: 90, sizes: '(max-width: 767px) calc(100vw - 48px), (max-width: 1440px) calc((100vw - 80px) * 0.6667), 906px' },
  brand: { width: 1200, widths: [600, 1200], quality: 90, sizes: '1200px', format: 'png' },
  social: { width: 1200, widths: [1200], ratio: 1200 / 630, quality: 90, sizes: '1200px', format: 'jpg' },
} as const;

export type ImageKind = keyof typeof imagePresets;
export function imageKey(source: string, kind?: ImageKind) {
  let key = source.replace(/^\/?src\/assets\/images\//, '').replace(/^\/images\//, '');
  const legacy = aliases.legacy as Record<string, string>;
  key = legacy[key] || key;
  if (kind === 'avatar') key = (aliases.avatar as Record<string, string>)[key] || key;
  return key;
}

export function isLocalImageKey(source: string) {
  return !/^(?:https?:|data:|blob:|\/\/)/i.test(source) && /\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(source);
}

// object-fit: cover can need more pixels than the visible box width. Preserve
// the original framing while accounting for the cropped image's painted size.
export function coverageSizes(sizes: string, height: string | undefined, aspect: number) {
  if (!height) return sizes;
  const entries: string[] = [];
  let depth = 0, start = 0;
  for (let index = 0; index < sizes.length; index++) {
    if (sizes[index] === '(') depth++;
    if (sizes[index] === ')') depth--;
    if (sizes[index] === ',' && depth === 0) { entries.push(sizes.slice(start, index).trim()); start = index + 1; }
  }
  entries.push(sizes.slice(start).trim());
  return entries.map(entry => {
    let end = -1, level = 0;
    if (entry.startsWith('(')) for (let index = 0; index < entry.length; index++) {
      if (entry[index] === '(') level++;
      if (entry[index] === ')' && --level === 0) { end = index; break; }
    }
    const condition = end >= 0 ? entry.slice(0, end + 1) + ' ' : '';
    const length = end >= 0 ? entry.slice(end + 1).trim() : entry;
    return condition + `max(${length}, calc(${height} * ${Number(aspect.toFixed(4))}))`;
  }).join(', ');
}
