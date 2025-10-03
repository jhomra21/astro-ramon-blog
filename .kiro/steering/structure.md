# Project Structure

## Root Configuration
- `astro.config.mjs`: Main Astro configuration with integrations and build settings
- `tailwind.config.mjs`: Tailwind CSS configuration with custom theme and plugins
- `tsconfig.json`: TypeScript configuration with strict mode and path aliases
- `components.json`: Shadcn/ui component library configuration
- `package.json`: Dependencies and scripts using Bun runtime

## Source Organization (`src/`)

### Core Files
- `consts.ts`: Global constants and site metadata
- `env.d.ts`: TypeScript environment definitions and Cloudflare types

### Components (`src/components/`)
- **Astro Components**: `.astro` files for server-side rendered components
- **React Components**: `.tsx` files for interactive client-side components
- **UI Components**: `ui/` - Shadcn/ui component library
- **Motion Components**: `motion-ui/` - Framer Motion animations
- **Providers**: `providers/` - React context providers
- **React Utilities**: `react/` - React-specific components

### Pages (`src/pages/`)
- **Static Pages**: `.astro` files for main site pages
- **API Routes**: `api/` - Server endpoints for dynamic functionality
- **Blog**: `blog/` - Blog post pages and listings
- **RSS Feed**: `rss.xml.js` - Automated RSS generation

### Content (`src/content/`)
- Content collections for blog posts and structured data
- MDX files for rich content with embedded components

### Layouts (`src/layouts/`)
- Page layout templates and shared structure components

### Utilities (`src/lib/`)
- Shared utility functions and helpers
- Type definitions and constants

### Styles (`src/styles/`)
- Global CSS and Tailwind customizations
- Component-specific styles when needed

## Build Output
- `dist/`: Production build output (static files)
- `.astro/`: Generated types and build artifacts

## Path Aliases
- `@/*`: Maps to `src/*` for clean imports
- `@/components`: Component imports
- `@/lib`: Utility functions
- `@/ui`: UI component library

## Naming Conventions
- **Astro Components**: PascalCase with `.astro` extension
- **React Components**: PascalCase with `.tsx` extension
- **Pages**: kebab-case for URLs, PascalCase for components
- **Utilities**: camelCase functions, PascalCase for classes
- **Constants**: UPPER_SNAKE_CASE for global constants