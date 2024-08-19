import Recipe from "@/model/recipe";

const recipes: Recipe[] = [
    {
        id: "0",
        name: "Anchor Steam Beer Clone",
        brewer: "Homebrewer",
        description: "A model beer with a big impact. You'll want to drink the whole batch, but don't!",
        batchSize: "5gal",
        boilTime: "60min",
        type: "steam",
        batchNumber: 0,
        efficiency: "75%",
        notes: "",
        grain: [
            { name: "2-row", weight: "16oz" }
        ],
        mash: [
            { name: "Single Infusion", weight: "16oz", temp: "185°", time: "60min" }
        ],
        hops: [
            { name: "cascade", weight: "1.0oz", alpha: "0.76%", boil: "15min" },
            { name: "cascade", weight: "1.0oz", alpha: "0.76%", boil: "50min" },
            { name: "cascade", weight: "1.0oz", alpha: "0.76%", boil: "60min" }
        ],
        yeast: [
            { name: "wyeast 1012", avg_attn: "70%", temp: "62", starter: true }
        ],
        targets: { og: 0, fg: 0, abv: 0.0, ibu: 0, srm: 30 }
    }
];

export default recipes;