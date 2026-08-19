import {readFileSync, writeFileSync} from "node:fs";
import {createRequire} from "node:module";
import {dirname, join} from "node:path";
import {fileURLToPath, URL} from "node:url";
import type {StorybookConfig} from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import {formatHex} from "culori";

const require = createRequire(import.meta.url);

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
    stories: ["../src/*.stories.@(ts|tsx)", "../src/components/**/*.stories.@(ts|tsx)"],
    framework: {
        name: "@storybook/react-vite",
        options: {}
    },

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
