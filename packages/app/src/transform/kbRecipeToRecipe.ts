import {KbRecipe} from "@brewdocs.beer/kb";
import Recipe, {RECIPE_MODEL_VERSION} from "@/model/recipe";
import {buildBrewable} from "@/transform/buildBrewable";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";
import {kbRecipeEquipmentToEquipment} from "@/transform/kbRecipeEquipmentToEquipment";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";

/**
 * Full KbRecipe -> Recipe mapping. Since Recipe extends KbRecipe (shared Scalar),
 * most fields carry over by spread; only the string-narrowed step/ingredient
 * arrays need a coercion. Drops the KB `id` (callers assign their own local id)
 * and records it as `sourceId`.
 */
export function kbRecipeToRecipe({id, ...kbRecipe}: KbRecipe): Omit<Recipe, "id"> {
    return {
        ...kbRecipe,
        version: RECIPE_MODEL_VERSION,
        sourceId: id,
        hops: kbRecipeHopsToHops(kbRecipe.hops),
        boil: kbRecipeBoilToBoil(kbRecipe.boil),
        mash: kbRecipeMashToMash(kbRecipe.mash),
        equipment: kbRecipeEquipmentToEquipment(kbRecipe.equipment),
        // derive assignments (ingredients) + per-phase equipment from the kb
        // recipe's arrays, rather than starting from an empty brewable — the
        // edit screen reads the brewable, so a copied recipe would otherwise
        // show no ingredients or equipment (same deriver createBatch uses)
        brewable: buildBrewable(kbRecipe),
    };
}
