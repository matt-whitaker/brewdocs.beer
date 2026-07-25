import {KbRecipe} from "@brewdocs.beer/kb";
import Recipe, {RECIPE_MODEL_VERSION} from "@/model/recipe";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";
import {kbRecipeEquipmentToEquipment} from "@/transform/kbRecipeEquipmentToEquipment";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";

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
        equipment: kbRecipeEquipmentToEquipment(kbRecipe.equipment),
        // the kb recipe already carries its own brewable; narrow it rather
        // than re-deriving one from the legacy arrays
        brewable: kbBrewableToBrewable(kbRecipe.brewable),
    };
}
