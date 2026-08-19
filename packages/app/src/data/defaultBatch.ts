import {UNITS} from "@brewdocs.beer/core";
import Batch from "@/model/batch";

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
