import {KbRecipe} from "@brewdocs.beer/kb";
import Batch from "@/model/batch";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";

export default function _updateRecipe(recipe: KbRecipe, batch: Partial<Batch>) {
    // grains/yeasts/additives share the app model shape now — passed through as-is;
    // only the string-narrowed arrays need coercion
    return Object.assign(batch, {
        hops: kbRecipeHopsToHops(recipe.hops),
        grains: recipe.grains,
        yeasts: recipe.yeasts,
        additives: recipe.additives,
        mash: kbRecipeMashToMash(recipe.mash),
        boil: kbRecipeBoilToBoil(recipe.boil),
    });
}

