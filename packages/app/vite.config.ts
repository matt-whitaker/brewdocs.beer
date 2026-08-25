import {resolve} from "node:path";
import {fileURLToPath, URL} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, Plugin} from "vite";
import {VitePWA} from "vite-plugin-pwa";
import {version} from "./package.json";

// Workspace packages ship raw, unbuilt TypeScript, so a package like design
// that imports its own files via "@/..." gets compiled as part of app's own
// bundle — and app's own "@" alias (below) would otherwise capture that
// specifier and resolve it against app/src instead. Resolve "@/..." against
// the nearest ancestor package's src/ dir (by importer path) so each
// workspace package's alias stays self-contained.
function workspaceAtAliasPlugin(): Plugin {
    return {
        name: "brewdocs-workspace-at-alias",
        enforce: "pre",
        resolveId(source, importer, options) {
            if (!source.startsWith("@/")) return null;
            const packageRoot = importer?.match(/^(.*[/\\]packages[/\\][^/\\]+)[/\\]src[/\\]/)?.[1];
            const srcDir = packageRoot ? resolve(packageRoot, "src") : fileURLToPath(new URL("./src", import.meta.url));
            return this.resolve(resolve(srcDir, source.slice(2)), importer, {skipSelf: true, ...options});
        }
    };
}

// "claudemac" is the LAN alias for this machine, allowed so `npm run dev:host`
// can be viewed from another computer.
const allowedHosts = ["claudemac", "claudemac.local"];

// the app's own version reaches the client through the env surface every other
// build-time value uses (src/utils/env.ts), so package.json stays the one place
// it is written down — a backup file records which version wrote it.
export default defineConfig({
    server: {allowedHosts},
    preview: {allowedHosts},
    define: {
        "import.meta.env.VITE_APP_VERSION": JSON.stringify(version)
    },
    plugins: [
        workspaceAtAliasPlugin(),

        tanstackRouter({target: "react", autoCodeSplitting: true}),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
                name: "BrewDocs - An offline web app for brew day",
                short_name: "BrewDocs",
                description: "An offline web app prototype of a standard brew day application",
                start_url: "/",
                display: "standalone",
                theme_color: "#5E81AC",
                background_color: "#ECEFF4",
                icons: [
                    {src: "pwa-192x192.png", sizes: "192x192", type: "image/png"},
                    {src: "pwa-512x512.png", sizes: "512x512", type: "image/png"},
                    {src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable"}
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"]
            }
        })
    ]
});
