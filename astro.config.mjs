// @ts-check
import { defineConfig, envField } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
    site: 'https://juanrmb.pages.dev',
    output: 'static',
    vite: {
        plugins: [tailwindcss()],
    },
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
        }),
        sitemap(),
        react(),
    ],
    markdown: {
        syntaxHighlight: 'shiki',
        shikiConfig: { theme: 'dracula' },
    }
});
