import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeWikiLinks from './src/lib/wikilinks.mjs';

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
    rehypePlugins: [rehypeWikiLinks],
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
