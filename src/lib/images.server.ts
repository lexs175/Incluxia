import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import slots from '../data/image-slots.json';
import { coverageSizes, imageKey, imagePresets, isLocalImageKey, type ImageKind } from './image-presets';

const rasterImports = import.meta.glob<{ default: ImageMetadata }>('../assets/images/**/*.{png,jpg,jpeg,webp,avif,gif}', { eager: true });
const vectorImports = import.meta.glob<string>('../assets/images/**/*.svg', { eager: true, query: '?url', import: 'default' });
const rasters = Object.fromEntries(Object.entries(rasterImports).map(([file, value]) => [file.split('/assets/images/')[1], value.default]));
const vectors = Object.fromEntries(Object.entries(vectorImports).map(([file, value]) => [file.split('/assets/images/')[1], value]));
export interface ResponsiveImage { src?: string; srcset?: string; sizes?: string; width?: number; height?: number; key?: string; }
const cache = new Map<string, Promise<ResponsiveImage>>();

export async function optimizedImage(source: string | undefined, kind: ImageKind = 'detail', sizes?: string): Promise<ResponsiveImage> {
  if (!source) return {};
  const key = imageKey(source, kind);
  if (vectors[key]) return { src: vectors[key], key };
  const metadata = rasters[key];
  if (!metadata) {
    if (isLocalImageKey(source)) throw Error('Imagen local sin registrar: ' + source);
    return { src: source };
  }
  const preset = imagePresets[kind];
  const baseSizes = sizes || preset.sizes;
  const finalSizes = coverageSizes(baseSizes, 'coverageHeight' in preset ? preset.coverageHeight : undefined, metadata.width / metadata.height);
  const identity = key + ':' + kind;
  if (!cache.has(identity)) cache.set(identity, (async () => {
    const ratio = 'ratio' in preset ? preset.ratio : undefined;
    const maximum = ratio ? Math.min(metadata.width, Math.floor(metadata.height * ratio)) : metadata.width;
    const width = Math.min(preset.width, maximum);
    const widths = [...new Set([...preset.widths.filter(value => value <= maximum), Math.min(preset.widths[preset.widths.length - 1], maximum)])];
    const result = await getImage({ src: metadata, width, ...(ratio ? { height: Math.round(width / ratio), fit: 'cover' as const, position: 'center' } : {}), widths, sizes: preset.sizes, format: 'format' in preset ? preset.format : 'webp', quality: preset.quality });
    return { src: result.src, srcset: result.srcSet.attribute || undefined, width: Number(result.attributes.width), height: Number(result.attributes.height), key };
  })());
  return { ...await cache.get(identity)!, sizes: finalSizes };
}

let manifest: Promise<Record<string, Partial<Record<ImageKind, ResponsiveImage>>>> | undefined;
export function clientImageManifest() {
  return manifest ||= (async () => {
    const result: Record<string, Partial<Record<ImageKind, ResponsiveImage>>> = {};
    await Promise.all(slots.assets.flatMap(asset => {
      const kinds: ImageKind[] = asset.role === 'profileCover' ? ['profileCover'] : asset.role === 'profile' || asset.role === 'story' || asset.role === 'companyLogo' ? ['avatar'] : asset.role === 'service' || asset.role === 'category' ? ['service'] : [];
      return kinds.map(async kind => { const image = await optimizedImage(asset.key, kind); (result[image.key!] ||= {})[kind] = image; });
    }));
    return result;
  })();
}
