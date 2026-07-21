import type {Migration} from "@brewdocs.beer/core";
import type {KbRecipe} from "../src/models";

// v0 is any recipe cached before the kb started stamping `version` at all —
// assumed for any record with no `version` field. Stub: stamps the current
// version only; real field-level transforms land here once the shape changes.
const recipesV0ToV1: Migration<KbRecipe> = {
    namespace: "kb.recipes",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

export default recipesV0ToV1;
