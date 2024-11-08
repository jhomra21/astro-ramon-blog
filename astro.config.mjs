// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    integrations: [
      mdx(), 
      sitemap(), 
      tailwind({
        applyBaseStyles: false,
      }), 
      react({
        include: ['**/react/*', '**/motion-ui/*', '**/components/**/*.tsx'],
      })
    ],
    vite: {
        optimizeDeps: {
            include: ['react', 'react-dom', '@tanstack/react-query'],
        },
        ssr: {
            noExternal: ['@tanstack/react-query'],
        },
    },
    output: 'server',
    adapter: cloudflare()
});