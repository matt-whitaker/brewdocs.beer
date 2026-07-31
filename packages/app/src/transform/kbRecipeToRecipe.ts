import {KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";

/**
 * Full KbRecipe -> Recipe mapping. Since Recipe extends KbRecipe (shared Scalar),
 * the top-level fields carry over by spread; only `brewable` needs narrowing
 * (the ingredient/equipment arrays are gone — they live on the brewable now).
 * Drops the KB `id` (callers assign their own local id) and records it as
 * `sourceId`.
 */
export function kbRecipeToRecipe({id, ...kbRecipe}: KbRecipe): Omit<Recipe, "id"> {
    return {
        ...kbRecipe,
        __type: "recipe",
        sourceId: id,
        brewable: kbBrewableToBrewable(kbRecipe.brewable),
    };
}
