import Batch from "@/model/batch";

const batches: Batch[] = [
    {
        id: "0",
        recipeId: "0",
        name: "Batch #1",
        brewer: "Anonymous",
        batchSize: "5gal",
        boilTime: "60min",
        batchNumber: 1,
        efficiency: "70%",
        status: "complete",
        grains: [
            { name: "German Pils", weight: "9.0lb" },
            { name: "40°L Crystal", weight: "1.0lb" },
            { name: "Special Robust", weight: "0.5lb" }
        ],
        mash: [
            { name: "Single Infusion", temp: "185°", time: "60min", grains: "all" }
        ],
        boil: [
            { name: "Single Boil", time: "60min", hops: "all" }
        ],
        hops: [
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "60min" },
            { name: "Northern Brewer", weight: "0.75oz", alpha: "7.4%", boil: "20min" },
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "k/o" }
        ],
        yeast: [
            { name: "Wyeast 2112", avg_attn: "70%", temp: "62", starter: true }
        ],
        equipment: [],
        actuals: { og: "1.05", fg: "1.014", abv: "4.7", ibu: "35", srm: "9" },

        hydrometer: []
    }
];

export default batches;