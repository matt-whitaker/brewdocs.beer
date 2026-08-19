import {resolve} from "node:path";
import {fileURLToPath, URL} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, Plugin} from "vite";
import {VitePWA} from "vite-plugin-pwa";

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

export default defineConfig({
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
