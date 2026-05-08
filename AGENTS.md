# AGENTS.md

## Project Overview

This repository is Juan's personal website, blog, and portfolio. It showcases technical writing, projects, and resume-style work samples as a static Astro site deployed to Cloudflare Pages at `juanrmb.pages.dev`.

## Stack

- Use **Bun** for package management and scripts. Do not use npm, pnpm, or yarn.
- Use **Astro 6** for pages, layouts, static rendering, content collections, RSS, and sitemap generation.
- Use **React 18** primarily for interactive islands; TSX components are also used for reusable static UI primitives.
- Use **TypeScript** for all code.
- Use **MDX** for blog and project content.
- Use **Tailwind CSS** for styling, with CSS only as a fallback.
- Use **shadcn/ui**, **Radix UI**, and existing `src/components/ui` primitives for reusable UI.
- Use **TanStack Query** for client-side API/server-state fetching.
- Use **Framer Motion** only where animation needs cannot be handled cleanly with CSS or Astro transitions.

## Commands

```bash
bun install
bun run dev
bun run start
bun run build
bun run preview
bun run astro ...
```

Validation:

```bash
bun run build
```

`bun run build` runs `astro check && astro build`. There are no separate lint, test, or format scripts currently defined.

## Repository Structure

```text
change-log.md          Dated implementation history and validation notes
README.md             Human-facing project overview and setup notes
src/
  assets/images/       Static source images used by Astro image handling
  components/          Astro and React components
    *.astro/*.tsx      Top-level site sections, header/footer, widgets, and shared presentational components
    ui/                shadcn/Radix-style primitives
    motion-ui/         Framer Motion text components
    providers/         React context/providers
    react/             React-only components
  content/             Blog posts and project entries
    blog/*.mdx
  layouts/             Shared Astro page layouts
  lib/                 Shared utilities and client stores
  pages/               Astro routes and RSS route
  styles/global.css    Tailwind layers and global CSS
  content.config.ts    Astro content collection schema and loaders
  consts.ts            Site-wide constants
  env.d.ts             Environment type declarations
```

Root config files:

- `astro.config.mjs`: Astro integrations, static output, Vite build config, image service, Markdown config, and `astro:env` schema.
- `tailwind.config.mjs`: Tailwind content paths, dark mode, theme tokens, typography, plugins.
- `components.json`: shadcn/ui configuration and aliases.
- `tsconfig.json`: strict TypeScript config and `@/*` path alias.

## README Conventions

- Keep `README.md` aligned with current project facts when dependencies, commands, deployment targets, or content architecture change.
- Keep README content human-facing and concise; detailed agent workflow belongs in `AGENTS.md`, and historical implementation notes belong in `change-log.md`.
- Do not document stale one-off experiments as active features unless they are still represented in routes, content, or components.

## Coding Conventions

- Analyze existing code and surrounding style before editing.
- Prefer Astro components for static page and layout UI.
- Prefer React components only when client-side interactivity is required.
- Use `@/*` imports for source-relative paths when it improves clarity.
- Match the style of the file being edited. This codebase has mixed quote and indentation styles.
- Use functional and declarative TypeScript. Avoid classes unless an existing API requires them.
- Prefer interfaces for object shapes in TSX components.
- Avoid enums; use literal unions or maps instead.
- Use descriptive names with auxiliary verbs for state, such as `isLoading` and `hasError`.
- Event handlers should use a `handle` prefix, such as `handleClick` or `handleKeyDown`.
- Prefer early returns for readability.
- Keep components organized as: exported component, small subcomponents, helpers, static content, types.
- Do not leave TODOs, placeholders, or partially implemented behavior.
- Do not add comments unless they clarify non-obvious behavior.

## Styling and UX

- Use Tailwind utility classes first.
- Use CSS in `src/styles/global.css` or component `<style>` blocks when utility classes are insufficient.
- Prefer Astro `class:list` / `class:` patterns over ternaries in class strings where practical.
- Maintain the current visual language:
  - Monospace typography.
  - Neutral/zinc palette.
  - Dark-mode support.
  - Swiss-inspired, clean portfolio aesthetic.
  - Square or subtle-radius surfaces.
  - Minimal borders, `glass-panel`, `link-underline`, badge-like details.
- Preserve mobile-first responsive design.
- Preserve accessibility attributes and keyboard behavior on interactive elements.
- Respect reduced-motion preferences.
- Optimize Web Vitals, especially LCP and CLS.
- Optimize images with Astro image handling when possible; prefer WebP and include dimensions/lazy loading where appropriate.

## Content Conventions

Blog, project, and content-backed page entries live in `src/content/blog/*.mdx`.

Required frontmatter:

```yaml
title: "Post Title"
description: "Short summary"
pubDate: "2026-01-01"
```

Optional frontmatter:

```yaml
updatedDate: "2026-01-02"
heroImage: "/src/assets/images/example.png"
tags: ["Astro", "Cloudflare"]
isProject: true
projectUrl: "https://example.com"
projectStatus: "live"
projectType: "featured"
githubUrl: "https://github.com/user/repo"
techStack:
  - name: "TypeScript"
    description: "Type-safe development"
```

Project entries are MDX posts with `isProject: true`.

The `about` entry is special: `src/content/blog/about.mdx` powers `/about` and should not be treated as a normal blog post or project card.

## Change Log Conventions

- Keep `change-log.md` updated for notable implementation work, dependency upgrades, migrations, cleanup reviews, and validation outcomes.
- Read `change-log.md` before editing it so entries stay ordered and do not duplicate existing history.
- Add new entries in reverse chronological order with the newest date first.
- Use `YYYY-MM-DD` headings.
- Keep entries concise and factual. Include:
  - codebase or feature state when useful,
  - work completed,
  - cleanup/review results,
  - validation commands and outcomes.
- Do not paste routine command output; summarize results such as `bun run build passed with 0 errors`.

## Data Fetching

- Use TanStack Query for client-side server-state/API fetching.
- Keep API keys and secrets out of client-side code.
- Only expose public environment variables with the `PUBLIC_` prefix when they are safe for browsers.
- Define environment variables in `astro.config.mjs` with `env.schema` and consume them through `astro:env/client` or `astro:env/server`.
- The header weather widget uses the public client variable `PUBLIC_OPENWEATHER_API_KEY` and OpenWeather from browser code. Treat this as public configuration, not a secret. If the variable is missing or OpenWeather rejects it, the widget renders nothing.

## Validation Requirements

After modifying code, configuration, or content, run:

```bash
bun run build
```

Fix all diagnostics before finishing. If a change only affects non-executable instructions such as this file, validation may still be run to ensure the repository remains healthy.

## Important Notes

- Do not invent facts about the project. Inspect the codebase and configs when unsure.
- Keep changes focused on the user's request.
- Prefer readability and maintainability over cleverness.
- The site is static-output optimized for Cloudflare Pages.
