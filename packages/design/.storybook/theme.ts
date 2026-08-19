import {create} from "storybook/theming/create";
import token from "./tokens.generated";

/**
 * Brand the Storybook manager (shell) from our tokens — a single source of truth
 * rather than hand-copied hex. `token` is a resolved map generated at config-load
 * by `.storybook/main.ts` (the manager builder can't read CSS via `?raw`): it
 * merges our authored `src/tokens.css` (`--font-sans`, hex `--color-beer-*`) with
 * the daisyui `nord` palette (`--color-base-*` etc., oklch).
 *
 * `main.ts` flattens the nord oklch palette to hex, so every colour here is
 * polished-safe — Storybook derives hover/active states through `polished`, which
 * can't parse oklch. The accent (`colorPrimary`/`colorSecondary`) is nord's own
 * Frost blue, matching the blue that dominates the app/www chrome.
 */
export default create({
    base: "light",

    brandTitle: "BrewDocs",
    brandUrl: "https://brewdocs.beer",
    brandTarget: "_self",

    colorPrimary: token["color-primary"],
    colorSecondary: token["color-secondary"],

    appBg: token["color-base-200"],
    appContentBg: token["color-base-100"],
    appPreviewBg: token["color-base-100"],
    appBorderColor: token["color-base-300"],
    appBorderRadius: 6,

    textColor: token["color-base-content"],
    textInverseColor: token["color-base-100"],
    textMutedColor: token["color-neutral"],

    barBg: token["color-base-100"],
    barTextColor: token["color-base-content"],
    barSelectedColor: token["color-primary"],

    inputBg: token["color-base-100"],
    inputBorder: token["color-base-300"],
    inputTextColor: token["color-base-content"],

    fontBase: token["font-sans"],
    fontCode: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
});
