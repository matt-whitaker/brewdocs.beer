import Batch from "@/model/batch";

const defaultBatch  = {
    batchSize: "5gal",
    efficiency: "75%",
    boilTime: "60min",
    status: "prep",
    actuals: { og: "0.00", fg: "0.00", abv: "0.0%", ibu: "0", srm: "0" },
    hydrometer: [
        {
            date: "0000-00-00",
            gravity: "0.00",
            name: "Before boil",
        },
        {
            date: "0000-00-00",
            gravity: "0.00",
            name: "After boil",
        },
        {
            date: "0000-00-00",
            gravity: "0.00",
            name: "After primary",
        },
        {
            date: "0000-00-00",
            gravity: "0.00",
            name: "After secondary",
        }
    ],
}

export default defaultBatch as Pick<Batch, keyof typeof defaultBatch>