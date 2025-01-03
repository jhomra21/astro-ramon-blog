// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://example.com',
    integrations: [
      mdx({
        syntaxHighlight: 'shiki',
        shikiConfig: { theme: 'dracula' },
        remarkPlugins: [],
        rehypePlugins: [],
        remarkRehype: {},
      }), 
      sitemap(), 
      tailwind({
        applyBaseStyles: false,
      }), 
      react()
    ],
    vite: {
      ssr: {
        noExternal: ['@tanstack/react-query']
      }
    },
    output: 'static',
    image: {
        service: {
            entrypoint: 'astro/assets/services/sharp',
            config: {
                limitInputPixels: false,
            }
        },
        domains: [],
        remotePatterns: []
    },
    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: { theme: 'dracula' },
        remarkPlugins: [],
        rehypePlugins: [],
    }
});