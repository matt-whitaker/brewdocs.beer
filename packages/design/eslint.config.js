import base from "../core/eslint.config.base.js";

// Shared base (style, imports, react-hooks, the @/-not-../ + no-lodash bans) lives in
// packages/core. Design has no package-specific overlay yet — react-refresh isn't
// needed since it's a component library, not an app with hot-reloadable routes.
export default [
    ...base,
    {
        // orphaned Storybook scaffolding (see CLAUDE.md) — excluded from consumer
        // builds, so linting it only produces findings nobody should fix.
        ignores: ["src/stories/**"]
    }
];
