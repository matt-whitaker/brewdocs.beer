import {UNITS} from "@brewdocs.beer/core";
import Batch from "@/model/batch";
import Statuses from "@/model/statuses";

/**
 * The out-of-the-box batch fields. A **factory**, not a shared const: a module-level
 * object would be spread into every batch by reference (`{...defaultBatch}` is
 * shallow), so any in-place mutation of a nested field — the `Object.assign`
 * style `_updateShopping` already uses — would leak across every batch created in
 * that session. Brew-day phases are not seeded here at all; they live on the
 * brewable, which is the plan's source of truth.
 */
const defaultBatch = () => ({
    tracker: {},
    batchSize: {
        value: "5gal",
        unit: UNITS.GALLONS
    },
    efficiency: {
        value: "75%",
        unit: UNITS.PERCENT
    },
    boilTime: {
        value: "60min",
        unit: UNITS.MINUTES
    },
    status: Statuses.PREP,
    actuals: {
        og: {
            value: "0.00°P",
            unit: UNITS.PLATO
        },
        fg: {
            value: "0.00°P",
            unit: UNITS.PLATO
        },
        abv: {
            value: "0.0%",
            unit: UNITS.PERCENT
        },
        ibu: "0",
        srm: "0"
    },
});

export default defaultBatch as () => Pick<Batch, keyof ReturnType<typeof defaultBatch>>;
