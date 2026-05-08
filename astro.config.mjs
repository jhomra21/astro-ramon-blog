// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://juanrmb.pages.dev',
    output: 'static', // Optimized for Cloudflare Pages static deployment
    env: {
        schema: {
            PUBLIC_OPENWEATHER_API_KEY: envField.string({
                context: 'client',
                access: 'public',
                optional: true,
            }),
        },
    },
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
        build: {
            // Optimize chunks for better performance
            cssCodeSplit: true,
            chunkSizeWarningLimit: 1000,
        },
        css: {
            // CSS optimization
            devSourcemap: true,
            modules: {
                scopeBehaviour: 'local'
            }
        },
        ssr: {
            noExternal: ['@tanstack/react-query']
        }
    },
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