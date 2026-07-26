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

// v2 is any batch stored before the brew-day tracker replaced per-item state
// (hydrometer, pitchedDate, Phase.equipment, and schedule/shopping-item
// completed/actual fields all dropped in favor of `batch.tracker`). There's no
// sound way to replay old checkoffs/actuals into tracker refs, so this stub
// only stamps the version and backfills an empty tracker — brew-day progress
// on a batch this old is lost either way (matches the POC's `/?purge=true`).
const batchV2ToV3: Migration<Batch> = {
    namespace: "app.batch",
    from: 2,
    to: 3,
    up: (data) => ({...data, version: 3, tracker: data.tracker ?? {}})
};

const batchMigrations: Migration<Batch>[] = [batchV0ToV1, batchV1ToV2, batchV2ToV3];

export default batchMigrations;
