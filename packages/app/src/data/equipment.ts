import Equipment from "@/model/equipment";

const equipment: Equipment[] = [
    { name: "Boil Kettle - 15gal", use: ["boil"] },
    { name: "Mash Tun - 10gal", use: ["mash"] },
    { name: "Stirring Wand", use: ["mash"] },
    { name: "Glass Carboy - 7gal", use: ["secondary"] },
    { name: "Sparge Vessel - 15gal", use: ["mash"] },
    { name: "Star San", use: ["clean"] },
    { name: "PBW", use: ["clean"] },
    { name: "Keg (Coke) - 5.5gal", use: ["condition", "serve"], count: 4 },
    { name: "Digital Hydrometer", use: ["measure"] },
    { name: "Long Thermometer", use: ["boil", "mash"] },
    { name: "Erlenmeyer Flask", use: ["starter"] },
    { name: "Large Stirring Spoon", use: ["boil"] },
    { name: "Racking Cane & Hose", use: ["transfer"] },
    { name: "Burner and stand", use: ["mash", "boil"]},
    { name: "Scale", use: ["boil", "starter"]},
    { name: "CO2", use: ["kegging"]},
];

export default equipment;