// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
    site: 'https://juanrmb.pages.dev',
    output: 'static', // Optimized for Cloudflare Pages static deployment
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
            rollupOptions: {
                output: {
                    manualChunks: {
                        'react-vendor': ['react', 'react-dom'],
                        'ui-vendor': ['@radix-ui/react-label', '@radix-ui/react-popover', '@radix-ui/react-select'],
                        'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge']
                    }
                }
            }
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