import {fileURLToPath, URL} from "node:url";
import type {StorybookConfig} from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
    stories: ["../src/components/**/*.stories.@(ts|tsx)"],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },
    // Storybook's own Vite instance doesn't auto-discover a project vite.config.ts
    // (design has none), so the Tailwind v4 plugin has to be wired in here explicitly
    // — otherwise design.css's @import/@plugin/@theme directives ship uncompiled.
    // Same reasoning for the "@/" alias below (mirrors packages/app/vite.config.ts's
    // resolve.alias) — tsconfig's "paths" only affects the type-checker, not the bundler.
    async viteFinal(viteConfig) {
        const {mergeConfig} = await import("vite");

        return mergeConfig(viteConfig, {
            plugins: [tailwindcss()],
            resolve: {
                alias: {
                    "@": fileURLToPath(new URL("../src", import.meta.url))
                }
            }
        });
    }
};

export default config;
