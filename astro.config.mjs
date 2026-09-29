import { defineConfig } from 'astro/config';

function preserveBackdropFilterPlugin() {
  return {
    name: 'preserve-backdrop-filter',
    enforce: 'post',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.css') && typeof asset.source === 'string') {
          asset.source = asset.source.replace(
            /-webkit-backdrop-filter:([^;]+);/g,
            (_, val) => `-webkit-backdrop-filter:${val};backdrop-filter:${val};`
          );
        }
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [preserveBackdropFilterPlugin()],
  },
});
