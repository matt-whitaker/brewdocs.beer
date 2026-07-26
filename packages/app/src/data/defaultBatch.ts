import {UNITS} from "@brewdocs.beer/core";
import Batch, {BATCH_MODEL_VERSION, Phase} from "@/model/batch";
import Statuses from "@/model/statuses";

/** the out-of-the-box BatchSchedule tabs: one per brew-day stage; equipment is derived live from the brewable */
const phases: Phase[] = [
    { name: "Mash", tags: ["mash"] },
    // chilling is just the closing gravity reading, so it rides along with the boil
    { name: "Boil", tags: ["boil"] },
    { name: "Ferment", tags: ["ferment"] }
];

const defaultBatch  = {
    version: BATCH_MODEL_VERSION,
    phases,
    tracker: {},
    // same placeholder the hydrometer dates use
    pitchedDate: "0000-00-00",
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
    hydrometer: [
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            name: "Before boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            name: "After boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            name: "After Ferment",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            name: "After secondary",
        }
    ],
};

export default defaultBatch as Pick<Batch, keyof typeof defaultBatch>;