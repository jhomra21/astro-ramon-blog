/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly FLIGHT_API_KEY: string;
  // Add other env vars here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
