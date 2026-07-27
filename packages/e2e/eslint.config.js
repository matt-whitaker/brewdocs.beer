import base from "../core/eslint.config.base.js";
import globals from "globals";
import tseslint from "typescript-eslint";

// Playwright specs run under Node, not the browser — override the base's
// browser globals so `process`/`__dirname` etc. resolve instead of erroring.
export default tseslint.config(
    ...base,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            globals: globals.node
        }
    }
);
