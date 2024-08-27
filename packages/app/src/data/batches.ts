import Batch from "@/model/batch";

const batches: Batch[] = [
    {
        id: "0",
        recipeId: "0",
        recipe: null,
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
        actuals: { og: "1.05", fg: "1.014", abv: "4.7", ibu: "35", srm: "9" },

        hydrometer: [
            { note: "wort", date: "2024-08-01", gravity: "1.051" },
            { note: "1wk", date: "2024-08-08", gravity: "1.018" },
            { note: "2wk", date: "2024-08-15", gravity: "1.014" }
        ],
        checklist: [
            {
                name: "Brew Day",
                items: [
                    { checked: false, name: "Mash Tun - 10gal" },
                    { checked: false, name: "Stirring Wand" },
                    { checked: false, name: "Sparge Vessel - 15gal" },
                    { checked: false, name: "Long Thermometer" },
                    { checked: false, name: "Burner and stand" },
                    { checked: false, name: "Boil Kettle - 15gal" },
                    { checked: false, name: "Long Stirring Spoon" },
                    { checked: false, name: "Scale" },
                    { checked: false, name: "Star San" },
                    { checked: false, name: "PBW" }
                ]
            },
            {
                name: "Rack Day",
                items: [
                    { checked: false, name: "Racking Cane & Hose" },
                    { checked: false, name: "Glass Carboy - 7gal" },
                    { checked: false, name: "Star San" },
                    { checked: false, name: "PBW" },
                ]
            },
            {
                name: "Key Day",
                items: [
                    { checked: false, name: "CO2" },
                    { checked: false, name: "Racking Cane & Hose" },
                    { checked: false, name: "Star San" },
                    { checked: false, name: "PBW" },
                    { checked: false, name: "Keg (Coke) - 5.5gal" },
                ]
            },
        ]
    }
];

export default batches;