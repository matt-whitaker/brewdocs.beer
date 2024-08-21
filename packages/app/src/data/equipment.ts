import Equipment from "@/model/equipment";

const equipment: Equipment[] = [
    { name: "Boil Kettle - 10gal", use: ["boil"] },
    { name: "Boil Kettle - 40gal", use: ["boil"] },
    { name: "Mash Tun - 10gal", use: ["mash"] },
    { name: "Glass Carboy - 7gal", use: ["ferment"] },
    { name: "Plastic Fermneter - 10gal", use: ["ferment"], count: 3 },
    { name: "Sparge Vessel - 15gal", use: ["mash"] },
    { name: "Star San", use: ["clean"] },
    { name: "PBW", use: ["clean"] },
    { name: "Keg (Coke) - 5.5gal", use: ["condition", "serve"], count: 4 },
    { name: "Digital Hydrometer", use: ["measure"] },
    { name: "Long Thermometer", use: ["boil", "mash"] },
    { name: "Erlenmeyer Flask", use: ["starter"] },
    { name: "Small glass", use: ["measure"], count: 4 },
    { name: "Small pipette", use: ["measure"] },
    { name: "Large aluminum spoon", use: ["boil"] },
    { name: "Racking cane & tube", use: ["transfer"] },
    { name: "Missing equipment", use: ["all"] }
];

export default equipment;