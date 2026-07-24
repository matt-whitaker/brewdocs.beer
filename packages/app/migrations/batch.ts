import type {Migration} from "@brewdocs.beer/core";
import type Batch from "../src/model/batch";
import {defaultBrewable} from "../src/model/brewable";

// v0 is any batch stored before BATCH_MODEL_VERSION existed — assumed for
// any record with no `version` field. Stub: stamps the current version
// only; real field-level transforms land here once the batch shape changes.
const batchV0ToV1: Migration<Batch> = {
    namespace: "app.batch",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

// v1 is any batch stored before `brewable` existed. Attaches a default
// brewable — batches this old were created before createBatch derived one,
// so there's no legacy data to populate it from.
const batchV1ToV2: Migration<Batch> = {
    namespace: "app.batch",
    from: 1,
    to: 2,
    up: (data) => ({...data, version: 2, brewable: data.brewable ?? defaultBrewable()})
};

const batchMigrations: Migration<Batch>[] = [batchV0ToV1, batchV1ToV2];

export default batchMigrations;
