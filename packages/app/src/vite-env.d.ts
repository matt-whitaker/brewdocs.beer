/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
    readonly VITE_WWW_URL?: string;
    readonly VITE_DEV_TOOLS?: string;
    readonly VITE_FEATURES_SEARCH_EVERYWHERE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
