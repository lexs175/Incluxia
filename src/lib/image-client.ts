import { imageKey, type ImageKind } from './image-presets';
interface ImageVariant { src: string; srcset?: string; sizes?: string; width?: number; height?: number; }
let previous: Element | null = null;
let manifest: Record<string, Partial<Record<ImageKind, ImageVariant>>> = {};
function images() {
  const node = document.getElementById('site-image-manifest');
  if (node !== previous) { previous = node; manifest = JSON.parse(node?.textContent || '{}'); }
  return manifest;
}
export function setImage(image: HTMLImageElement, source: string | undefined, kind?: ImageKind, sizes?: string) {
  const family = kind || image.dataset.imageKind as ImageKind || 'avatar';
  const asset = source ? images()[imageKey(source, family)]?.[family] : undefined;
  if (asset) {
    if (asset.srcset) image.srcset = asset.srcset; else image.removeAttribute('srcset');
    image.sizes = sizes || image.dataset.imageSizes || asset.sizes || '100vw';
    if (asset.width) image.width = asset.width;
    if (asset.height) image.height = asset.height;
    image.dataset.imageSource = imageKey(source!, family);
    if (image.getAttribute('src') !== asset.src) image.src = asset.src;
  } else {
    image.removeAttribute('srcset'); image.removeAttribute('sizes'); delete image.dataset.imageSource;
    if (source && image.getAttribute('src') !== source) image.src = source; else if (!source) image.removeAttribute('src');
  }
}
