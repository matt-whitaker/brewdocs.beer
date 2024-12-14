import Batch from "@/model/batch";
import {Units} from "@brewdocs.beer/core";
import Statuses from "@/model/statuses";

const defaultBatch  = {
    batchSize: {
        value: "5gal",
        unit: Units.GALLONS
    },
    efficiency: {
        value: "75%",
        unit: Units.PERCENT
    },
    boilTime: {
        value: "60min",
        unit: Units.MINUTES
    },
    status: Statuses.PREP,
    actuals: {
        og: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        fg: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        abv: {
            value: "0.0%",
            unit: Units.PERCENT
        },
        ibu: "0",
        srm: "0"
    },
    hydrometer: [
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "Before boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After boil",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After primary",
        },
        {
            date: "0000-00-00",
            gravity: {
                value: "0.00°P",
                unit: Units.PLATO
            },
            name: "After secondary",
        }
    ],
}

export default defaultBatch as Pick<Batch, keyof typeof defaultBatch>