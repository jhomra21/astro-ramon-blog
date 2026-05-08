# Juan.dev: Personal Blog and Portfolio

Welcome to Juan.dev, a personal blog and portfolio site showcasing my work and expertise. I am a software developer specializing in web development.

## Tech Stack

This site is built using a modern tech stack to ensure high performance, scalability, and a seamless user experience:

- **Astro 6**: Static site generation, routing, content collections, RSS, sitemap generation, and image optimization.
- **React 18**: Interactive UI islands plus reusable TSX UI primitives.
- **TypeScript**: Strict type checking for application and component code.
- **Tailwind CSS**: A utility-first CSS framework for styling, providing a responsive and customizable design.
- **MDX**: Blog and project content authored as Markdown with JSX support.
- **shadcn/ui and Radix UI**: Reusable UI primitives.
- **TanStack Query**: Client-side API fetching for the weather widget.
- **Framer Motion**: For creating smooth animations and transitions.
- **Lucide Icons**: A collection of beautiful and customizable icons used throughout the site.
- **Sharp**: Image optimization during builds.
- **Bun**: JavaScript runtime and package manager for installing dependencies and running scripts.
- **Cloudflare Pages**: Static deployment target.

## Features

- **Blog**: Technical writing powered by Astro content collections and MDX.
- **Portfolio/projects**: Project entries are stored as blog MDX content with `isProject: true`.
- **Content-backed about page**: `/about` is rendered from the special `src/content/blog/about.mdx` entry.
- **Routes and feeds**: Includes home, about, projects, blog index, individual `/blog/[slug]/` pages, `/rss.xml`, and generated sitemap output.
- **Weather widget**: Header weather uses OpenWeather data for the configured default location when `PUBLIC_OPENWEATHER_API_KEY` is configured.
- **Responsive Design**: Ensures the site looks great on all devices.
- **SEO Optimized**: Includes canonical URLs and OpenGraph data for better search engine visibility.
- **Interactive Components**: React powers focused islands such as weather, dialog, and motion/text effects.
- **Content Management**: Uses `src/content.config.ts` and `src/content/blog/*.mdx` for structured content.
- **RSS and Sitemap**: Generates feed and sitemap output during builds.
- **Performance**: Optimized for speed and efficiency, ensuring a seamless user experience.

## Configuration

Optional public environment variables:

| Variable | Purpose |
| :------- | :------ |
| `PUBLIC_OPENWEATHER_API_KEY` | Enables live weather data in the header widget. |

The site is configured for static output with `site: "https://juanrmb.pages.dev"` in `astro.config.mjs`.

## Commands

Use Bun for all project commands:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies using Bun                  |
| `bun run dev`             | Starts local dev server at `localhost:4321`      |
| `bun run start`           | Alias for `bun run dev`                          |
| `bun run build`           | Installs with the frozen lockfile, then builds the production site to `./dist/` |
| `bun run build:site`      | Runs Astro check/build without installing dependencies |
| `bun run preview`         | Previews the build locally before deploying      |
| `bun run astro ...`       | Runs Astro CLI commands                          |
| `bun run astro -- --help` | Displays help for the Astro CLI                  |

Cloudflare Pages uses `bun run build`. The script keeps a frozen install in the build command because the current Pages project runs the user build command directly. `bun run build:site` runs only `astro check && astro build`.

## Project Notes

- `AGENTS.md` contains repo-specific guidance for coding agents.
- `change-log.md` tracks notable implementation work, migrations, cleanup reviews, and validation results in reverse chronological order.

## Learn More

For more information, visit the [Astro documentation](https://docs.astro.build) or join the [Astro Discord server](https://astro.build/chat).
