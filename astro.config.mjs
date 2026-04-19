import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://streamers.wiki',
  trailingSlash: 'ignore',
  integrations: [
    mdx(),
    sitemap({
      changefreq: 'daily',
      priority: 0.8,
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  build: {
    format: 'directory',
  },
  vite: {
    ssr: {
      noExternal: ['cytoscape', 'cytoscape-cose-bilkent'],
    },
  },
});
