/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_WWW_URL?: string;
    readonly VITE_DEV_TOOLS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
