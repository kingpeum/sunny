import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    esbuild: { jsx: 'automatic' },
    server: { host: '0.0.0.0', port: 3000 },
    plugins: standalone ? [
      {
        name: 'standalone-favicon',
        transformIndexHtml(html) {
          const icon = readFileSync(new URL('./public/favicon.svg', import.meta.url), 'utf8');
          return html.replace('href="/favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(icon)}"`);
        },
      },
      viteSingleFile({ removeViteModuleLoader: true, outputFileName: 'momo-garden.html' }),
    ] : [],
    build: standalone ? { outDir: 'standalone', copyPublicDir: false } : {},
  };
});
