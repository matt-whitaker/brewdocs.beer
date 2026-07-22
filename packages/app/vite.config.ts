import {fileURLToPath, URL} from "node:url";
import tailwindcss from "@tailwindcss/vite";
import {tanstackRouter} from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import {defineConfig, Plugin} from "vite";
import {VitePWA} from "vite-plugin-pwa";
// Relative, not the "@brewdocs.beer/core" bare specifier: this file is loaded
// by Vite's own Node config bundler, which treats bare imports as external
// and leaves them for Node to resolve at runtime — and Node can't parse
// core's raw .ts source (workspace packages ship TypeScript, unbuilt).
// Relative imports get inlined and transpiled into the config bundle instead.
import {buildMigrationPlan, serializeMigrationPlan, MIGRATION_PLAN_ELEMENT_ID} from "../core/src/migration";
import kbMigrations from "../kb/migrations";
import appMigrations from "./migrations";

// Collects every package's migrations into one plan at build/dev-server
// start, and stamps it into index.html so the app can read its current
// migration state without shipping the (Node-only-safe-to-collect) migration
// definitions themselves into the browser bundle.
function migrationPlanPlugin(): Plugin {
    const plan = buildMigrationPlan([...kbMigrations, ...appMigrations]);
    const steps = serializeMigrationPlan(plan);

    return {
        name: "brewdocs-migration-plan",
        transformIndexHtml() {
            return [{
                tag: "script",
                attrs: {id: MIGRATION_PLAN_ELEMENT_ID, type: "application/json"},
                children: JSON.stringify(steps),
                injectTo: "head"
            }];
        }
    };
}

export default defineConfig({
    plugins: [
        // must come before react()
        tanstackRouter({target: "react", autoCodeSplitting: true}),
        react(),
        tailwindcss(),
        migrationPlanPlugin(),
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
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    }
});
