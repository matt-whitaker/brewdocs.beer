import Batch from "@/model/batch";

const batches: Batch[] = [
    {
        id: "0",
        name: "Batch #2",
        recipeId: "0",
        brewDate: new Date(),
        status: "prep",
        hydrometer: [
            { date: new Date(), gravity: "30"}
        ],
        actuals: { og: 0, fg: 0, abv: 0.0, ibu: 0, srm: 30 },
    }
];

export default batches;