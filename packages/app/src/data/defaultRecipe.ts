import {Units} from "@brewdocs.beer/core";
import Recipe, {RECIPE_MODEL_VERSION} from "@/model/recipe";

const defaultRecipe: Omit<Recipe, "id"> = {
    version: RECIPE_MODEL_VERSION,
    name: "",
    brewer: "",
    type: "",
    description: "",
    batchSize: {
        value: "5gal",
        unit: Units.GALLONS
    },
    efficiency: {
        value: "75%",
        unit: Units.PERCENT
    },
    boilTime: {
        value: "60min",
        unit: Units.MINUTES
    },
    targets: {
        og: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        fg: {
            value: "0.00°P",
            unit: Units.PLATO
        },
        abv: {
            value: "0.0%",
            unit: Units.PERCENT
        },
        ibu: "0",
        srm: "0"
    },
    mash: [],
    boil: [],
    grains: [],
    hops: [],
    yeasts: [],
    additives: [],
    equipment: [],
};

export default defaultRecipe;
