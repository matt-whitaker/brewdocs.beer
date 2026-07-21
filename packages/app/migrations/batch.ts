import type {Migration} from "@brewdocs.beer/core";
import type Batch from "../src/model/batch";

// v0 is any batch stored before BATCH_MODEL_VERSION existed — assumed for
// any record with no `version` field. Stub: stamps the current version
// only; real field-level transforms land here once the batch shape changes.
const batchV0ToV1: Migration<Batch> = {
    namespace: "app.batch",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

export default batchV0ToV1;
