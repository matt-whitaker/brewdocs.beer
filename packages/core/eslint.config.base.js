import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import stylistic from "@stylistic/eslint-plugin";
import importX from "eslint-plugin-import-x";
import tseslint from "typescript-eslint";

/**
 * Shared flat-config base for the workspace's TypeScript/React packages (app, www).
 * Consumers spread this and add their own overlay — see each package's eslint.config.js.
 *
 * This is dev tooling, NOT part of core/src, so it doesn't touch core's
 * environment-agnostic runtime surface. It lives in core because core already
 * owns the eslint tooling deps; promote it to a standalone `@brewdocs.beer/eslint-config`
 * package if the config outgrows this.
 *
 * Covers everything both consumers share: language + style + import conventions +
 * react-hooks. Package-specific concerns stay in the consumer overlay (app: react-refresh,
 * its `func.ts` any-escape, the generated route tree; www: whatever Astro needs).
 */
export default tseslint.config(
    { ignores: ["dist"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser
        },
        plugins: {
            "react-hooks": reactHooks,
            "@stylistic": stylistic,
            "import-x": importX
        },
        rules: {
            ...reactHooks.configs.recommended.rules,

            // style conventions — codify what the code already does (double quotes,
            // semicolons, 4-space indent) so these are near-zero auto-fixes.
            "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
            "@stylistic/semi": ["error", "always"],
            "@stylistic/indent": ["error", 4],

            // reach into a sibling workspace package by its name, not a relative
            // path that climbs out of the package (../../../../kb → @brewdocs.beer/kb)
            "import-x/no-relative-packages": "error",

            // group + alphabetize imports: external → @brewdocs.beer/* workspace →
            // @/ internal → relative (parent → sibling). Both app and www use the @/ alias.
            "import-x/order": ["error", {
                groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                pathGroups: [
                    { pattern: "@brewdocs.beer/**", group: "external", position: "after" },
                    { pattern: "@/**", group: "internal" }
                ],
                pathGroupsExcludedImportTypes: ["builtin"],
                "newlines-between": "never",
                alphabetize: { order: "asc", caseInsensitive: true }
            }],

            // leading _ marks deliberate throwaways — destructured skips (`const [_, x] = …`)
            // and unused stub params. Honor the convention rather than editing each site.
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_"
            }]
        }
    },
    {
        // Import conventions scoped to source. Deliberately NOT applied to build/script
        // files at the package root (vite.config.ts, astro.config.mjs), which
        // legitimately reach into sibling packages' internals by relative path.
        files: ["src/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                paths: [{ name: "lodash", message: "Don't add lodash — use the workspace's hand-rolled helpers." }],
                patterns: [
                    { group: ["lodash", "lodash/*"], message: "Don't add lodash — use the workspace's hand-rolled helpers." },
                    // intra-package modules go through the @/ alias, not a relative path
                    // that climbs out of the current directory. Same-dir ./ is fine.
                    { group: ["../*", "../**"], message: "Import intra-package modules via the @/ alias, not a relative parent path." }
                ]
            }]
        }
    }
);
