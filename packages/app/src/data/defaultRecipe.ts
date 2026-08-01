import {UNITS} from "@brewdocs.beer/core";
import Brewable, {defaultBrewable} from "@/model/brewable";
import Recipe from "@/model/recipe";

export default function defaultRecipe(brewable: Brewable = defaultBrewable()): Omit<Recipe, "id"> {
    return {
        __type: "recipe",
        name: "",
        brewer: "",
        type: "",
        description: "",
        batchSize: {
            value: "5gal",
            unit: UNITS.GALLONS
        },
        efficiency: {
            value: "75%",
            unit: UNITS.PERCENT
        },
        boilTime: {
            value: "60min",
            unit: UNITS.MINUTES
        },
        targets: {
            og: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            fg: {
                value: "0.00°P",
                unit: UNITS.PLATO
            },
            abv: {
                value: "0.0%",
                unit: UNITS.PERCENT
            },
            ibu: "0",
            srm: "0"
        },
        brewable,
    };
}
