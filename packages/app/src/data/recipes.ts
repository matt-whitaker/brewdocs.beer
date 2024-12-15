import Recipe from "@/model/recipe";
import {Units} from "@brewdocs.beer/core";

const recipes: Recipe[] = [
    {
        id: "0",
        name: "Anchor Steam Beer Clone",
        brewer: "Anonymous",
        description: "Clone of the famous California staple, Anchor's Steam Beer",
        batchSize: {
            value: "5gal",
            unit: Units.GALLONS
        },
        boilTime: {
            value: "60min",
            unit: Units.MINUTES
        },
        type: "amber_lager",
        efficiency: {
            value: "70%",
            unit: Units.PERCENT
        },
        grains: [
            {
                name: "German Pils",
                weight: {
                    value: "9.0lb",
                    unit: Units.POUNDS
                }
            },
            {
                name: "Crystal Malt 40L",
                weight: {
                    value: "1.0lb",
                    unit: Units.POUNDS
                }
            },
            {
                name: "Special Robust",
                weight: {
                    value: "0.5lb",
                    unit: Units.POUNDS
                }
            }
        ],
        mash: [
            {
                name: "Single Infusion",
                temp: {
                    value: "185°",
                    unit: Units.FAHRENHEIT
                },
                time: {
                    value: "60min",
                    unit: Units.MINUTES,
                },
                grains: "all"
            }
        ],
        boil: [
            {
                name: "Single Boil",
                time: {
                    value: "60min",
                    unit: Units.MINUTES
                },
                hops: "all"
            }
        ],
        hops: [
            {
                name: "Northern Brewer",
                weight: {
                    value: "1.0oz",
                    unit: Units.OUNCES
                },
                alpha: {
                    value: "7.4%",
                    unit: Units.PERCENT
                },
                boil: {
                    value: "60min",
                    unit: Units.MINUTES
                },
                phase: "boil"
            },
            {
                name: "Northern Brewer",
                weight: {
                    value: "0.75oz",
                    unit: Units.OUNCES
                },
                alpha: {
                    value: "7.4%",
                    unit: Units.PERCENT
                },
                boil: {
                    value: "20min",
                    unit: Units.MINUTES
                },
                phase: "boil"
            },
            {
                name: "Northern Brewer",
                weight: {
                    value: "1.0oz",
                    unit: Units.OUNCES
                },
                alpha: {
                    value: "7.4%",
                    unit: Units.PERCENT
                },
                boil: {
                    value: "k/o"
                },
                phase: "boil"
            }
        ],
        yeast: [
            {
                name: "Wyeast 2112",
                avg_attn: {
                    value: "70%",
                    unit: Units.PERCENT
                },
                temp: {
                    value: "62°F",
                    unit: Units.FAHRENHEIT
                }
            }
        ],
        additives: [
            {
                name: "Yeast Nutrients",
                boil: {
                    value: "15min",
                    unit: Units.MINUTES
                }
            },
            {
                name: "Irish Moss",
                boil: {
                    value: "15min",
                    unit: Units.MINUTES
                }
            }
        ],
        equipment: [
            { name: "Boil Kettle - 15gal", use: ["boil"] },
            { name: "Mash Tun - 10gal", use: ["mash"] },
            { name: "Stirring Wand", use: ["mash"] },
            { name: "Glass Carboy - 7gal", use: ["secondary"] },
            { name: "Sparge Vessel - 15gal", use: ["mash"] },
            { name: "Star San", use: ["clean"] },
            { name: "PBW", use: ["clean"] },
            { name: "Keg (Coke) - 5.5gal", use: ["condition", "serve"], count: 1 },
            { name: "Digital Hydrometer", use: ["measure"] },
            { name: "Long Thermometer", use: ["boil", "mash"] },
            { name: "Erlenmeyer Flask", use: ["starter"] },
            { name: "Large Stirring Spoon", use: ["boil"] },
            { name: "Racking Cane & Hose", use: ["transfer"] },
            { name: "Burner and stand", use: ["mash", "boil"]},
            { name: "Scale", use: ["boil", "starter"]},
            { name: "CO2", use: ["kegging"]},
        ],
        checklist: [
            { name: "Brew Day", uses: ["mash", "boil", "clean", "primary"] },
            { name: "Rack Day", uses: ["transfer", "secondary", "clean"] },
            { name: "Keg Day", uses: ["kegging", "transfer", "clean", "serve"] }
        ],
        targets: {
            og: {
                value: "1.05°P",
                unit: Units.PLATO
            },
            fg: {
                value: "1.014°P",
                unit: Units.PLATO
            },
            abv: {
                value: "4.7%",
                unit: Units.PERCENT
            },
            ibu: "35",
            srm: "9"
        }
    }
];

export default recipes;