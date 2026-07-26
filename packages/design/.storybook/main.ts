import {readFileSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath, URL} from "node:url";
import type {StorybookConfig} from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import {formatHex} from "culori";

// The manager (Storybook's shell) is a separate app whose builder does NOT support
// Vite's `?raw`, so it can't read our CSS from inside its own bundle. Instead, at
// config-load (this runs in Node) we read our authored tokens + the daisyui `nord`
// palette — both plain CSS with literal values — and emit a resolved token map that
// `.storybook/theme.ts` imports. Single source of truth, regenerated from CSS on
// every start; no hand-copied hex. The generated file is git-ignored.
const require = createRequire(import.meta.url);
// Storybook's `polished` opacifies several theme colors and can't parse oklch, so
// the daisyui nord palette (oklch) is flattened to hex here; non-color values
// (fonts, radii) are left untouched.
const toHex = (v: string): string => (v.startsWith("oklch(") ? formatHex(v) ?? v : v);
const cssVars = (file: string): Record<string, string> =>
    Object.fromEntries(
        [...readFileSync(file, "utf8").matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, toHex(v.trim())])
    );
const tokens = {
    ...cssVars(fileURLToPath(new URL("../src/tokens.css", import.meta.url))),
    ...cssVars(join(dirname(require.resolve("daisyui/package.json")), "theme/nord.css"))
};
writeFileSync(
    fileURLToPath(new URL("./tokens.generated.ts", import.meta.url)),
    `// GENERATED from src/tokens.css + daisyui nord by .storybook/main.ts — do not edit by hand.\nconst tokens: Record<string, string> = ${JSON.stringify(tokens, null, 4)};\nexport default tokens;\n`
);

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
