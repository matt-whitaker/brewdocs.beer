import Batch from "@/model/batch";

const batches: Batch[] = [
    {
        id: "0",
        name: "Batch #2",
        recipeId: "0",
        brewDate: "2024-08-01",
        status: "complete",
        hydrometer: [
            { note: "post boil", date: "2024-08-01", gravity: "1.045"},
            { note: "one week", date: "2024-08-08", gravity: "1.018"},
            { note: "two weeks", date: "2024-08-015", gravity: "1.013"}
        ],
        actuals: { og: "1.045", fg: "1.013", abv: "0.0", ibu: "0", srm: "12" },
    }
];

export default batches;