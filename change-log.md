# Change Log

This file tracks notable repository state, implementation work, cleanup reviews, and validation results. Keep entries in reverse chronological order with the newest date first.

## 2026-10-07

### Work completed

- Upgraded all dependencies to the latest stable releases, including Astro 7.3.6, `@astrojs/mdx` 8.0.3, `@astrojs/react` 7.0.1, `@astrojs/sitemap` 3.7.4, React and React DOM 19.3.0, Framer Motion 14.0.0, the Radix UI packages, TanStack Query 5.104.1, Lucide React 1.52.0, `react-day-picker` 10.0.2, and `tailwind-merge` 3.7.0.
- TypeScript stays on 6.0.3: 7.0.2 is the latest release, but `@astrojs/check` 0.9.10 only supports TypeScript 5 and 6.
- No source changes were needed for the new major versions.
- Compacted project cards in `ProjectsSection.astro`: the invalid `md:grid-cols-[280px,1fr]` grid made the 1920x1080 preview stack full width. Cards are now text-first: the title sits top-left with the year badge (and LIVE badge) at the top right, the description and tech badges sit below the title beside a bounded thumbnail (56px square on mobile, 140x88 from `sm`, vertically centered against the description and tech block, `object-cover object-center`, decorative `alt=""`), and the footer links are right-aligned across the full card width with no divider. The thumbnail uses a 280x176 WebP source, and no image-loading script or opacity gate. Cards without `heroImage` render text only.
- Fixed the missing spaces in the hero bio ("in modern", "and full-stack") with explicit `{" "}` in `HeroSection.astro`.
- Added a CSS-only `.reveal` entrance in `global.css` (opacity + 8px `translateY`, `cubic-bezier(0.23, 1, 0.32, 1)`) across hero groups, the projects heading, and project cards. Delays and durations come from one source, `src/lib/reveal.ts`, applied through `--reveal-delay`, `--reveal-duration`, and `--reveal-scale`. Hero order follows reading order: portrait 0ms (100ms duration, slight 0.94 scale-up plus the 8px rise), name 120ms, subtitle 220ms, bio 300ms, social links 380ms, buttons 460ms, then the projects heading at 520ms and cards at 50ms steps after it (step capped at 9). Other reveals run 260ms. The portrait `Image` now uses `priority` (eager, sync decode, high fetch priority) because the default `loading="lazy" decoding="async"` let the photo pop in after the 100ms circle animation had ended. When a page opens through the cross-document view transition (sweep mask hides the new page for about 450ms), a `pagereveal` listener in `TransitionLayout.astro` adds a 450ms `--vt-offset` so the sequence starts once the page is visible. The name scramble now skips itself under reduced motion. Reduced motion falls back to a 150ms opacity fade with no stagger. Removed the page-wide `animate-in` blur wrapper from the home page so it does not stack with the stagger.
- Reassessed Bun overrides: removed `@babel/core`, `sharp`, and `svgo` because the tree now resolves current versions without them. Kept `fast-uri` (3.1.8) and `yaml` (2.9.1) at patched versions, and added `http-cache-semantics` (4.3.0), `postcss-selector-parser` (7.1.6), `source-map-js` (1.2.2), and `undici` (8.11.2) to clear new advisories.
- Added an optional `npmUrl` frontmatter field (`z.url()`) and an `NPM Package` link with the npm logo directly after `Git Repo` on project cards (`ProjectsSection.astro`) and the project detail header (`BlogPost.astro`). Set it for Mesurer Solid (`https://www.npmjs.com/package/mesurer-solid`, the unscoped package whose npm metadata points at `packages/mesurer` and which the repository README installs), GPUix Solid (`https://www.npmjs.com/package/gpuix-solid`), and BG Cut (`https://www.npmjs.com/package/bgcut`).
- Added the featured BG Cut project entry (`src/content/blog/bgcut.mdx`) from the local repository README, `package.json`, `AGENTS.md`, and `CHANGELOG.md`, with live site `https://bgcut.dev`, GitHub `https://github.com/jhomra21/bgcut`, and the repository's own `docs/images/bgcut-ui.webp` screenshot copied to `src/assets/images/bgcut-ui.webp`. The post describes only released 0.6.1 behavior and marks the local video editor as an unreleased experiment.

- Fixed the NPM links missing from the running dev server on `http://127.0.0.1:4321`. The source, schema, and MDX were correct (production builds already emitted the links), but the long-running `astro dev` process kept serving pages without them: `/` and `/blog/bgcut` still rendered `Git Repo` and no NPM link, and it ignored even the later label edit in `ProjectsSection.astro` and `BlogPost.astro`, so it was running stale state from before the `npmUrl` schema and component changes (hot reload logged "Content config changed" but did not take effect). Stopped the stale process, deleted the generated `.astro` and `node_modules/.astro` caches, and started a fresh dev server; no source change was required for the fix. Renamed the link label from `NPM` to `NPM Package` in both places. After a restart that was killed with its shell, the server was started detached.
- Centered the hero as a vertical stack at all screen widths and softened the reveal entrance from an 8px rise to 4px with a default scale of 0.98.
- Made the portrait entrance clearly visible before the name: it now starts at 80ms and runs 220ms; subsequent hero reveals start at 220ms, 320ms, 400ms, 480ms, and 560ms, with projects at 620ms. Reduced-motion styling remains a fade without stagger or scale.
- Compressed the homepage reveal delays toward a 700ms first-project completion: hero delays are proportionally scaled to 53ms, 144ms, 210ms, 262ms, 315ms, and 367ms; projects start at 390ms. Portrait duration, card step, and 260ms project reveal duration are unchanged, so the first project finishes at 700ms.
- Removed global smooth scrolling so browser refresh scroll restoration is immediate; in-page scrolling uses the browser default.

### Validation

- After the restart, the dev server serves exactly one `npmjs.com/package/bgcut`, `gpuix-solid`, and `mesurer-solid` link each on `/` and `/projects`, and one on each matching `/blog/<slug>` page, all labelled `NPM Package`. `bun run build` passed with 0 errors and 0 warnings, and the built `dist` pages contain the same links.
- `bun pm view` confirmed `bgcut` (latest 0.6.1), `mesurer-solid` (latest 0.2.1), and `gpuix-solid` (latest 0.2.0) exist on npm with repository metadata pointing at the matching `jhomra21` GitHub repositories.
- After the `npmUrl` and BG Cut changes, `bun run build` passed with 0 errors, 0 warnings, and 0 hints across 21 generated pages; the built `/projects` page contains one NPM link each for `bgcut`, `gpuix-solid`, and `mesurer-solid`.
- `bun outdated` lists only TypeScript 7 as newer, blocked by the `@astrojs/check` peer range.
- `bun audit` reports no vulnerabilities.
- `bun run build` passed with 0 errors, 0 warnings, and 0 hints across 20 generated pages.
- Browser check of `/` at 1024, 768, and 390px: no horizontal overflow, thumbnails measured 140x88 (56x56 at 390px), cards 150-350px tall, and reduced-motion emulation applied the fade-only animation.

## 2026-08-24

### Work completed

- Added featured project entries for Mesurer Solid and GPUix Solid from the current public GitHub repositories.
- Updated the collaborative DAW entry with its latest synthesizer/editor, MIDI, local-first storage, collaboration, backup, and AI-assisted workflow work.
- Added a Mesurer showcase image and temporary Solid logo artwork so both new project cards use the site’s full image layout.
- Rewrote the DAW post around `feat/model-independent-control-platform`, covering canonical control contracts, transport adapters, extension boundaries, packaged acceptance, and deferred work.
- Applied the global Stop Slop and Cursor technical-writing guidance to the three project posts, tightening prose while preserving their implementation details.
- Upgraded the local dependency set to Astro 7.2.6, the Astro integrations, React 19, Sharp 0.35.3, and the current compatible UI/tooling releases.
- Migrated Tailwind from the deprecated `@astrojs/tailwind` integration to Tailwind 4 through `@tailwindcss/vite`, preserving the existing Tailwind config and scoped component styles.
- Added Bun overrides for patched transitive versions of Babel, fast-uri, Sharp, SVGO, and YAML; `bun audit` now reports no vulnerabilities.

### Validation

- Verified project names, repository links, README capabilities, and recent commit details against GitHub before authoring the entries.
- `bun run build` passed with 0 errors, 0 warnings, and 0 hints across 20 generated pages.

## 2026-05-08

### Codebase state

- Personal website, blog, and portfolio built as a static Astro site for Cloudflare Pages.
- Cloudflare Pages is configured to build with Bun 1.3.11.
- Uses Astro, React islands, TypeScript, MDX content collections, Tailwind CSS, shadcn/Radix UI primitives, Framer Motion, TanStack Query, RSS, sitemap generation, and Sharp image optimization.
- Blog and project entries live in `src/content/blog/*.mdx`; project entries are blog content with `isProject: true`.
- Main routes include home, about, projects, blog listing, dynamic blog posts, and RSS feed.

### Work completed

- Added MACROS as a featured project entry with a local app screenshot, GitHub link, product site link, and architecture summary.
- Simplified build configuration by moving Astro-only work into `build:site`, making the Cloudflare install step quieter, and removing redundant Astro/Vite image defaults.
- Replaced Bun's binary lockfile with a Bun 1.3.11-compatible text `bun.lock` so Cloudflare Pages can run `bun install --frozen-lockfile`.
- Added a frozen Bun install step to the build script because Cloudflare Pages executed the build command without installing dependencies first.
- Added `AGENTS.md` as the consolidated agent guidance file.
- Removed legacy `.cursorrules` and `.kiro/` guidance files after migrating their relevant instructions.
- Upgraded Astro and related integrations to Astro 6-compatible versions.
- Migrated content collections from legacy `src/content/config.ts` to Astro 6 `src/content.config.ts` with a `glob()` loader.
- Updated content entry usage from legacy `slug`/entry `.render()` patterns to Astro 6 `id` and `render(entry)` patterns.
- Removed incompatible manual Rollup chunk configuration from `astro.config.mjs`.
- Fixed RSS generation to use content entry IDs so generated feed links point to real blog URLs.
- Simplified `ProjectsSection.astro` by loading project entries once and deriving repeated project links once per card.
- Audited documentation against the live codebase with subagents and filled gaps in README and agent guidance for routes, content-backed pages, React usage, weather configuration, and build commands.
- Switched weather environment access to Astro's typed `astro:env` schema and removed stale custom Cloudflare runtime declarations.
- Removed IP geolocation from the weather widget and made missing or rejected OpenWeather configuration fail silently by hiding the widget.
- Ran post-implementation simplify review; accepted scoped cleanup by tightening project metadata schema literals, removing placeholder/obvious comments, and simplifying the weather fetch around the fixed default location.
- Ran defensive-code review; removed impossible `pubDate` fallbacks and guards in the blog index because the content schema requires `pubDate`.

### Review and validation

- Reproduced Cloudflare's install path with `bun install --frozen-lockfile`; install passed on Bun 1.3.11.
- Checked current Astro and Cloudflare Pages docs before simplifying the build configuration.
- Verified the build script now installs dependencies before running Astro check/build.
- Ran code review and validated the RSS finding against generated `dist/rss.xml`.
- Ran simplify review; accepted scoped cleanup in `ProjectsSection.astro`.
- Initial defensive-code review found no high-confidence redundant guards; the final follow-up review removed impossible `pubDate` fallbacks in the blog index.
- Final validation with `git diff --check` and `bun run build` passed with `0 errors`, `0 warnings`, and `0 hints`.
