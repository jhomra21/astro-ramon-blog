# Technology Stack

## Core Framework
- **Astro 5.9.2**: Static site generator with hybrid rendering capabilities
- **React 18**: Interactive UI components and client-side functionality
- **TypeScript**: Strict type checking with null checks enabled
- **Bun**: JavaScript runtime for package management and build processes

## Styling & UI
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Shadcn/ui**: Component library using Radix UI primitives (New York style)
- **Tailwind Animate**: Animation utilities
- **Framer Motion**: Advanced animations and transitions
- **Lucide React**: Icon library

## Content & Data
- **MDX**: Markdown with JSX for rich content authoring
- **TanStack Query**: Server state management for API calls
- **Sharp**: Image optimization and processing

## Development Tools
- **ESLint/Prettier**: Code formatting and linting (via Astro config)
- **Shiki**: Syntax highlighting with Dracula theme
- **TypeScript strict mode**: Enhanced type safety

## Build & Deployment
- **Static Output**: Optimized for Cloudflare Pages deployment
- **Vite**: Build tool with custom chunk splitting for performance
- **RSS/Sitemap**: Automated generation for SEO

## Common Commands

```bash
# Development
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:4321)
bun run start        # Alias for dev

# Production
bun run build        # Type check + build for production
bun run preview      # Preview production build locally

# Utilities
bun run astro        # Run Astro CLI commands
```

## Environment Variables
- `FLIGHT_API_KEY`: API key for flight tracking functionality
- `NODE_ENV`: Environment mode
- `PLATFORM`: Deployment platform detection