import Recipe from "@/model/recipe";

const recipes: Recipe[] = [
    {
        id: "0",
        name: "Anchor Steam Beer Clone",
        brewer: "Anonymous",
        description: "Clone of the famous California staple, Anchor's Steam Beer",
        batchSize: "5gal",
        boilTime: "60min",
        type: "amber_lager",
        batchNumber: 0,
        efficiency: "70%",
        notes: "",
        grain: [
            { name: "German Pils", weight: "9.0lb" },
            { name: "40°L Crystal", weight: "1.0lb" },
            { name: "Special Robust", weight: "0.5lb" }
        ],
        mash: [
            { name: "Single Infusion", weight: "16oz", temp: "185°", time: "60min" }
        ],
        hops: [
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "60min" },
            { name: "Northern Brewer", weight: "0.75oz", alpha: "7.4%", boil: "20min" },
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "k/o" }
        ],
        yeast: [
            { name: "Wyeast 2112", avg_attn: "70%", temp: "62", starter: true }
        ],
        targets: { og: "1.05", fg: "1.014", abv: "4.7", ibu: "35", srm: "9" }
    }
];

export default recipes;