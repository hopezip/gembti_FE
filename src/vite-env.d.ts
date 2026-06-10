/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_USE_MOCK: 'true' | 'false';
  readonly VITE_STEAM_AUTH_START_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
