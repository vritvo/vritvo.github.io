// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://victoriaritvo.com',

  markdown: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
  },

  adapter: cloudflare(),
});