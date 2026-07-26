import base from "../core/eslint.config.base.js";

// Shared base (style, imports, react-hooks, the @/-not-../ + no-lodash bans) lives in
// packages/core. Design has no package-specific overlay yet — react-refresh isn't
// needed since it's a component library, not an app with hot-reloadable routes.
// .storybook/* sits outside src/, so the src/**-scoped no-restricted-imports rule
// (../ ban) doesn't apply to its relative "../src/design.css" import.
export default [
    ...base,
    // generated from CSS by .storybook/main.ts on every start — not hand-authored
    {ignores: [".storybook/tokens.generated.ts"]}
];
