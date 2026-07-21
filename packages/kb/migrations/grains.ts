import type {Migration} from "@brewdocs.beer/core";
import type {KbGrain} from "../src/models";

// v0 is any grain cached before the kb started stamping `version` at all —
// assumed for any record with no `version` field. Stub: stamps the current
// version only; real field-level transforms land here once the shape changes.
const grainsV0ToV1: Migration<KbGrain> = {
    namespace: "kb.grains",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

export default grainsV0ToV1;
