import Batch from "@/model/batch";

const batches: Batch[] = [
    {
        id: "0",
        recipeId: "0",
        name: "Batch #1",
        brewer: "Anonymous",
        brewDate: "0000-00-00",
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
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "60min", phase: "boil" },
            { name: "Northern Brewer", weight: "0.75oz", alpha: "7.4%", boil: "20min", phase: "boil" },
            { name: "Northern Brewer", weight: "1.0oz", alpha: "7.4%", boil: "k/o", phase: "boil" }
        ],
        yeast: [
            { name: "Wyeast 2112", avg_attn: "70%", scalar: "62°", starter: false }
        ],
        additives: [
            { name: "Yeast Nutrients", when: "boil", scalar: "15min" },
            { name: "Irish Moss", when: "boil", scalar: "15min" }
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
                name: "Keg Day",
                items: [
                    { checked: false, name: "CO2" },
                    { checked: false, name: "Racking Cane & Hose" },
                    { checked: false, name: "Star San" },
                    { checked: false, name: "PBW" },
                    { checked: false, name: "Keg (Coke) - 5.5gal" },
                ]
            },
        ],
        shopping: [
            {
                name: "Hops",
                items: [
                    { name: "Northern Brewer", weight: "2.75oz", purchased: true, cost: "$0.00"}
                ]
            },
            {
                name: "Grain",
                items: [
                    { name: "German Pils", weight: "9.0lb", purchased: true, cost: "$0.00" },
                    { name: "40°L Crystal", weight: "1.0lb", purchased: true, cost: "$0.00" },
                    { name: "Special Robust", weight: "0.5lb", purchased: true, cost: "$0.00" }
                ]
            },
            {
                name: "Yeast",
                items: [
                    { name: "Wyeast 2112", purchased: true, cost: "$0.00" }
                ]
            },
            {
                name: "Other",
                items: [
                    { name: "Yeast Nutrients", purchased: true, cost: "$0.00" },
                    { name: "Irish Moss", purchased: true, cost: "$0.00" }
                ]
            },
        ]
    }
];

export default batches;
