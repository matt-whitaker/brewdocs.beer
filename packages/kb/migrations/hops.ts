import type {Migration} from "@brewdocs.beer/core";
import type {KbHop} from "../src/models";

// v0 is any hop cached before the kb started stamping `version` at all —
// assumed for any record with no `version` field. Stub: stamps the current
// version only; real field-level transforms land here once the shape changes.
const hopsV0ToV1: Migration<KbHop> = {
    namespace: "kb.hops",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

export default hopsV0ToV1;
