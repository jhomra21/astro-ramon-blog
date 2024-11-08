/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly FLIGHT_API_KEY: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly FLIGHT_API_KEY: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
