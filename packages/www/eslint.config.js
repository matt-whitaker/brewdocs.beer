import base from "../core/eslint.config.base.js";

// Shared base (style, imports, react-hooks, the @/-not-../ + no-lodash bans) lives in
// packages/core. This adds the small www/Astro-specific overlay.
//
// The base lints `.ts`/`.tsx` — the React islands and data files. `.astro` files are
// not linted (that needs eslint-plugin-astro + astro-eslint-parser); add those if you
// want full-fidelity Astro linting.
export default [
    ...base,
    {
        // `.astro/` is Astro's generated types dir (its routeTree.gen.ts equivalent,
        // gitignored) — linting it only produces findings nobody should fix.
        ignores: [".astro/**"]
    },
    {
        // triple-slash references are idiomatic — and Astro-required — in .d.ts files.
        files: ["**/*.d.ts"],
        rules: { "@typescript-eslint/triple-slash-reference": "off" }
    }
];
