import type {Migration} from "@brewdocs.beer/core";
import type {KbAdditive} from "../src/models";

// v0 is any additive cached before the kb started stamping `version` at all —
// assumed for any record with no `version` field. Stub: stamps the current
// version only; real field-level transforms land here once the shape changes.
const additivesV0ToV1: Migration<KbAdditive> = {
    namespace: "kb.additives",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

export default additivesV0ToV1;
