# AGENTS.md

## Project Overview

This repository is Juan's personal website, blog, and portfolio. It showcases technical writing, projects, and resume-style work samples as a static Astro site deployed to Cloudflare Pages at `juanrmb.pages.dev`.

## Stack

- Use **Bun** for package management and scripts. Do not use npm, pnpm, or yarn.
- Use **Astro 7** for pages, layouts, static rendering, content collections, RSS, and sitemap generation.
- Use **React 19** primarily for interactive islands; TSX components are also used for reusable static UI primitives.
- Use **TypeScript** for all code.
- Use **MDX** for blog and project content.
- Use **Tailwind CSS 4** through `@tailwindcss/vite`, with CSS only as a fallback.
- Use **shadcn/ui**, **Radix UI**, and existing `src/components/ui` primitives for reusable UI.
- Use **TanStack Query** for client-side API/server-state fetching.
- Use **Framer Motion** only where animation needs cannot be handled cleanly with CSS or Astro transitions.

## Commands

```bash
bun install
bun run dev
bun run start
bun run build
bun run build:site
bun run preview
bun run lint
bun run lint:fix
bun run astro ...
```

Validation:

```bash
bun run lint
bun run build
```

`bun run build` runs `bun install --frozen-lockfile --silent` before `bun run build:site` for Cloudflare Pages compatibility. `bun run build:site` runs `astro check && astro build`. `bun run lint` runs Oxlint with `.oxlintrc.json`. There are no test or format scripts currently defined.

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
tools/oxlint/anti-slop/ Vendored anti-slop Oxlint plugin (see UPSTREAM.md)
```

Root config files:

- `astro.config.mjs`: Astro integrations, static output, Vite build config, image service, Markdown config, and `astro:env` schema.
- `tailwind.config.mjs`: Tailwind content paths, dark mode, theme tokens, typography, plugins.
- `components.json`: shadcn/ui configuration and aliases.
- `tsconfig.json`: strict TypeScript config and `@/*` path alias.
- `.oxlintrc.json`: Oxlint config with the anti-slop plugin and `eslint/complexity` (max 10).

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
- Keep `bun run lint` clean. Do not disable, downgrade, or suppress anti-slop or complexity rules to pass lint; split complex functions, parse external data at its boundary (for example with `zod/mini`), and remove type assertions rather than annotating them.
- Treat `tools/oxlint/anti-slop/` as vendored code. Use the global `install-anti-slop` skill to update it, and keep `UPSTREAM.md` accurate.

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

The resume PDF is not in the repo. It lives in the Cloudflare R2 bucket `juanrmb-assets` as `juan-martinez-resume.pdf`, served from the bucket's public r2.dev URL that `about.mdx` links to. To replace it, upload over the same key with `bunx wrangler r2 object put juanrmb-assets/juan-martinez-resume.pdf --remote --file <pdf> --content-type application/pdf --content-disposition 'inline; filename=juan-martinez-resume.pdf'`. `inline` makes browsers open it in their PDF viewer, which has its own download button.

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
bun run lint
bun run build
```

Fix all diagnostics before finishing. If a change only affects non-executable instructions such as this file, validation may still be run to ensure the repository remains healthy.

## Reference Codebases
Reference these codebases when designing apis, code, solutions or other programming things. They are cloned locally on the Mac; on Windows, read them on GitHub.
- https://github.com/diffusionstudio/monorepo-new (Fullstack Video Editing Platform/app) [Programming Code]
- https://github.com/joshpuckett/dialkit (Real-time parameter tweaking for React, Solid, Svelte, and Vue) [UI Code]
- https://github.com/sst/opencode/tree/v2 (OpenCode v2 app reference for Solid persistence, app preferences, and product architecture) [Programming Code]
- https://github.com/solidjs-community/solid-primitives (Solid Primitives source and docs, especially storage/persistence primitives) [Library Reference]
- daw-effect-research (DAW/audio effect implementation reference) [Audio DSP Reference]: Mac only, at `/Users/juan/Documents/daw-effect-research`; it has no git remote.
- https://github.com/earendil-works/pi [Pi]
- https://github.com/anomalyco/opentui [OpenTUI]

## Important Notes

- Do not invent facts about the project. Inspect the codebase and configs when unsure.
- Keep changes focused on the user's request.
- Prefer readability and maintainability over cleverness.
- The site is static-output optimized for Cloudflare Pages.
