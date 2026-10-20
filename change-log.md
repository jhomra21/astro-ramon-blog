# Change Log

This file tracks notable repository state, implementation work, cleanup reviews, and validation results. Keep entries in reverse chronological order with the newest date first.

## 2026-10-20

### Work completed

- Created the Cloudflare R2 bucket `juanrmb-assets`, uploaded the resume as `juan-martinez-resume.pdf` with `Content-Type: application/pdf` and `Content-Disposition: attachment`, and enabled the bucket's public r2.dev URL. The About page's Get in Touch list now has a "Resume (PDF)" download link under Email, and the closing "Let's build something amazing together! 🚀" line is gone. The PDF stays out of the public repo, so it can be replaced without a commit; `AGENTS.md` records the upload command.
- Added a Reference Codebases section to `AGENTS.md` with the same list as the global agent instructions, using GitHub URLs. `daw-effect-research` is Mac-only because it has no git remote.
- Reviewed the site with the `impeccable` detector, the `design-taste-frontend` (taste-skill v2) lint and browser inspector, and a `break-ui` worst-case data pass, keeping the current monospace, zinc, Swiss look. Findings that target that look (monospace, hairline borders, gradients, shadows, 14px body text) were left alone on purpose.
- The homepage name is now the page's `<h1>` (it was a `<div>`, so the homepage had no `h1`).
- Contrast: header links and the weather city use `neutral-500` instead of `neutral-400` (2.5:1 before), tech badge text uses darker shades in light mode (TypeScript was 3.8:1, Cloudflare 2.6:1), and the footer copyright and "Built with" line use `white/60` instead of `white/40`.
- Tech badge tooltips wrap at a 16rem maximum width instead of one unbroken line (up to 483px wide, which ran off both edges on phones). They open above the badge at any height. A small script in `ProjectsSection.astro` shifts a tooltip back inside the viewport when its badge is near an edge, and keeps the arrow on the badge.
- The mobile menu button is a 44px tap target (32px before). Project descriptions cap at 75 characters per line. The page wrapper and `body` use `min-h-dvh` instead of `min-h-screen`. The loading skeleton pulse respects reduced motion.
- Installed the `install-anti-slop` agent skill globally at `~/.factory/skills/install-anti-slop` from `dmmulroy/anti-slop` commit `13909c9`, so every Droid project can use it.
- Vendored the anti-slop Oxlint plugin into `tools/oxlint/anti-slop/` with the skill's installer and recorded provenance in `tools/oxlint/anti-slop/UPSTREAM.md`. The Effect rule group is not registered because the site does not depend on `effect`.
- Added `oxlint` and `@oxlint/plugins` 1.89.0 (exact pins) as dev dependencies, a `.oxlintrc.json` that enables every generic anti-slop rule plus `oxc/no-accumulating-spread` at `error`, and `bun run lint` / `bun run lint:fix` scripts.
- Enabled Oxlint's native port of the ESLint `complexity` rule at `["error", { "max": 10 }]`, so the project does not need a separate ESLint setup.
- Applied `require-readable-spacing` with lint autofix across 26 files (blank lines only) and removed a useless regex escape in `HeaderLink.astro`.
- Rewrote the MCP dialog to clear the complexity and `no-runtime-typeof` findings (complexity 37 and 28 before). JSON-RPC parsing now lives in `src/lib/mcp.ts` and validates server messages at the boundary with `zod/mini` schemas. Connection state lives in `src/components/react/useMcpConnection.ts`. `InfoDialog.tsx` is split into small subcomponents with the same markup and classes. SSE and endpoint failures now leave the status at `Error`; before, the following disconnect reset it to `Idle` in the same render. The unreachable `id: 0` capabilities branch was removed because the client never sends request id 0.
- Added `zod` (^4.6.7) as a direct dependency for `zod/mini`. The full `astro/zod` build added about 90 KB to the island. With `zod/mini`, the `InfoDialog` chunk is 93.5 KB raw (29.7 KB gzip), up from 72.3 KB raw.
- Removed every unexplained type assertion instead of adding `SAFETY:` comments: `HeroSection.astro` now statically imports the portrait (`src/env.d.ts` declares the uppercase `*.JPG` module), `TechBadge.tsx` looks up colors in a `Map`, `Header.astro` checks `event.target instanceof Element`, and `textscramble.tsx` types `as` as an intrinsic tag and memoizes `motion.create` so the element is not recreated on every scramble tick.
- Deleted the unused `src/components/Tooltip.tsx` and `src/components/LucideIcon.tsx`. Nothing imported `Tooltip`, and `LucideIcon` needed a cast over the whole `lucide-react` namespace.
- Fixed dialogs sliding in diagonally from the top left. Tailwind 4 centers with the `translate` property, so the Tailwind 3 era `slide-in-from-left-1/2` / `slide-in-from-top-[48%]` keyframe offsets in `ui/dialog.tsx` stacked on top of the centering instead of replacing it. Removed the four slide classes to match shadcn's current Tailwind 4 `DialogContent`.
- Replaced `tailwindcss-animate` with `tw-animate-css` (^1.4.0), following shadcn's Tailwind 4 migration: removed the plugin from `tailwind.config.mjs` and added `@import "tw-animate-css"` to `global.css`. `tailwindcss-animate` ignored `duration-*` under Tailwind 4, so dialog animations ran at its 150ms default.
- Removed `duration-300 ease-in-out` from the MCP dialog content so it uses the shared dialog timing, and set that timing to 150ms (`duration-150`, shadcn uses 200ms) with `ease`. `transition-all` stays, so the width change when a tool is selected still animates (now 150ms).
- Added `cursor-pointer` to the MCP Server trigger, the dialog close button, and the MCP Connect/Disconnect buttons, because Tailwind 4 buttons default to `cursor: default`.
- Installed all 15 skills from `emilkowalski/skills` (commit `2d22863`, MIT) globally in `~/.factory/skills/`, then audited the site against the motion, mobile, and UI-review skills and applied the fixes below.
- Motion tokens: `global.css` defines `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` and `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` in `@theme static`, and makes `--ease-out` the default transition timing. The `ease-out` utility, `.reveal` entrances, dialogs, and plain `transition-*` utilities now share one curve.
- Replaced every `transition-all` / `transition: all` with explicit properties (hero links, CTAs, portrait, `.link-hover`, `.link-underline`, prose links, `HeaderLink`, `TechBadge`, MCP dialog, QuickLinks cards). Fixed the `duration-2005` typo on the twitter link.
- Press feedback: the hero CTAs, the MCP trigger, the shared `Button`, the mobile menu button, the blog back button, and the copy button scale down on `:active` (0.97, 0.9 for the icon button) over 150ms. Removed the CTAs' hover lift and grow (`-translate-y-1`, `scale-[1.02]`), which competed with the press. CTA and dialog close focus rings moved from `focus:` to `focus-visible:` so they no longer appear after a mouse click.
- Removed the unlayered `.animate-in` override in `TransitionLayout.astro`. It replaced tw-animate's `animate-in` with a 0.7s blur fade (from `opacity: -10`) for the MCP tool panel and results. Those now use 200ms fades, and the tool response panel slides in 0.5rem instead of its full width.
- MCP dialog: the width change animates only `max-width` (200ms ease-out, which also sets the dialog enter/exit to 200ms), `will-change` on layout properties was removed, the copy/check icon swap uses opacity, scale 0.25, and 4px blur over 200ms, and tool list items are real buttons with `aria-pressed` instead of clickable `<li>` elements, so they work from the keyboard.
- Mobile menu: animates `grid-template-rows` (200ms open, 150ms close) instead of `max-height` with `ease-in`, uses `inert` while closed so hidden links are not focusable (it used `aria-hidden` on focusable links), closes on Escape and returns focus to the menu button, and the scroll listener is passive.
- Reduced motion: the hero status pulse and the LIVE ping use `motion-safe:`, the footer divider shimmer only runs with `prefers-reduced-motion: no-preference`, and the header typewriter shows the full title without the typing loop.
- Footer link underlines animate `transform: scaleX()` instead of `width`, and also show on keyboard focus. Card border hover colors in `ProjectsSection` and `QuickLinks` only apply on devices with a fine pointer, so taps do not leave sticky hover states. The weather pill no longer has a hover background, since it is not interactive. `TechBadge` tooltips rise 4px while fading in.
- Mobile baseline: transparent tap highlight, `touch-action: manipulation` on interactive elements, `text-size-adjust: 100%`, and `<meta name="theme-color" content="#ffffff">`. `:root` now uses `color-scheme: light` (dark only under `html.dark`), because nothing enables dark mode and `light dark` gave dark-OS visitors dark scrollbars on the light page.
- Removed dead styles: the unused `<style>` block in `index.astro`, the unused scale-in and border-draw CSS and `ANIMATION_CONFIG` fields in `HeroSection.astro`, the nonexistent `group-hover:shadow-3xl` class, and the unused typewriter cursor keyframes.

### Validation

- After the review pass: `bun run lint` passed with 0 problems and `bun run build` passed with 0 errors, 0 warnings, and 0 hints. The impeccable detector no longer reports low contrast. The taste-skill inspector finds one `h1`. Nothing overflows the page at 320px or 390px. Hovering every tech badge (98 on `/projects`, 38 on the homepage) at 320, 390, 900, and 1280px kept every tooltip inside the viewport with its arrow centered on the badge.
- `bun run lint` passed with 0 problems, and a second `oxlint --fix` pass left the tree unchanged.
- `bun run build` passed with 0 errors, 0 warnings, and 0 hints from `astro check`, and built 23 pages.
- After the design and animation pass: `bun run lint` passed with 0 problems, and `bun run build` passed with 0 errors, 0 warnings, and 0 hints. In the dev server, `--ease-out` is the computed timing for transitions and `.reveal`, the CTA transitions only `background-color, box-shadow, scale`, the MCP dialog stays centered and enters over 200ms with the ease-out curve, the mobile menu opens to its content height and closes on Escape with focus back on the button, and the menu stays hidden at desktop widths.
- In the built site, the MCP dialog stays centered in the viewport and fades in from 95% scale over 150ms with `ease` timing, and closes with a 150ms exit. The trigger and close button show a pointer cursor. The overlay fades over 150ms. The homepage `.reveal` animations are unchanged.

## 2026-10-12

### Work completed

- Added featured entries for two public GitHub repositories that were missing from the portfolio: `audiocn-solid` and `robot-heads-solid`. Each `pubDate` is the repository's GitHub creation date: 2026-10-02 and 2026-10-09.
- Both entries link their hosted pages through `projectUrl` with `projectStatus: 'live'`: the audiocn docs site and the robot-heads playground. `robot-heads-solid` also links its npm package.
- Copied the audiocn README hero (`site/public/og/home-14a5416dabae.png`, 1200x630) to `src/assets/images/audiocn-solid-home.png`. `robot-heads-solid` has no suitable image, so its entry has no `heroImage`.
- The `robot-heads-solid` repository has no GitHub description, so its entry is based on its README, `package.json`, and `src/RobotHead.tsx`.
- Removed the `air-local` and `ours-privacy-demo` entries and the Privacy Rehearsal screenshot (`src/assets/images/ours-privacy-demo-desktop.png`), which only the removed entry used. Both were added earlier today and removed at the owner's request.
- The featured set is now seven projects: DAW (`daw-browser-convex`, 2025-10-01), MACROS, Mesurer Solid, GPUix Solid, BG Cut, robot-heads-solid, and audiocn-solid. FastAI Photos, `thebrandbe`, `convex-cloudflare-workers-solid-spa`, `do-per-user-convex-multi-db`, and `do-better-auth-convex-testing` lost `projectType: 'featured'` and stay on `/projects`. All five are older than DAW.
- `ProjectsSection.astro` has a `featuredOnly` prop that filters to `projectType: 'featured'` before the `maxProjects` slice. `index.astro` passes `maxProjects={7} featuredOnly`, up from 5 unfiltered, so all seven featured projects fit. Without the higher limit, DAW (2025-10-01) would drop off. `totalProjects` still counts every project, so the "See all projects" link stays. `/projects` keeps `maxProjects={999}`.

### Validation

- Read each repository README and `package.json` through the GitHub API. `https://audiocn-solid.jhonra121.workers.dev` and `https://robot-heads-solid.jhonra121.workers.dev` each returned HTTP 200. `robot-heads-solid@0.2.0` exists on npm. `audiocn-solid` is not published to npm.
- `bun run build` passed with 0 errors, 0 warnings, and 0 hints from `astro check`, and built 23 pages, including `/blog/audiocn-solid` and `/blog/robot-heads-solid`.
- The fresh `dist` has no `/blog/air-local` or `/blog/ours-privacy-demo` routes and no references to either removed entry or the privacy screenshot. The homepage renders seven project cards (robot-heads-solid, BG Cut, audiocn Solid, GPUix Solid, Mesurer Solid, MACROS, DAW) and none of the older unfeatured entries. `/projects` renders all 18 remaining project cards, including the older entries, and none of the removed ones.

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
- Set the first homepage project card to start at 290ms and finish at 550ms by starting projects at 240ms; compressed hero delays to 35ms, 95ms, 139ms, 173ms, 208ms, and 241ms. Kept the 50ms card step, portrait and card durations, 4px rise, and scale values unchanged. Refined the shared entrance easing from `cubic-bezier(0.23, 1, 0.32, 1)` to the gentler `cubic-bezier(0.2, 0.8, 0.2, 1)` so movement and opacity ease out without an abrupt early snap.
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
