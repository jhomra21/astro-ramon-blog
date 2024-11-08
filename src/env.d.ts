/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly FLIGHT_API_KEY: string;
  readonly NODE_ENV: string;
  readonly PLATFORM?: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Define runtime env for Cloudflare
declare namespace App {
  interface Locals {
    runtime: {
      env: {
        FLIGHT_API_KEY: string;
        NODE_ENV?: string;
      };
    };
  }
}
