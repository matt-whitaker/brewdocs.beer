import {KbRecipe} from "@brewdocs.beer/kb";
import Recipe, {RECIPE_MODEL_VERSION} from "@/model/recipe";
import {kbRecipeAdditivesToAdditives} from "@/transform/kbRecipeAdditivesToAdditives";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";
import {kbRecipeEquipmentToEquipment} from "@/transform/kbRecipeEquipmentToEquipment";
import {kbRecipeGrainsToGrains} from "@/transform/kbRecipeGrainsToGrains";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";
import {kbRecipeYeastsToYeasts} from "@/transform/kbRecipeYeastsToYeasts";

/**
 * Full KbRecipe -> Recipe mapping, reusing the same per-field transforms
 * _updateRecipe uses for the ingredient arrays. Omits `id`: callers assign
 * their own local id rather than carrying the KB filename-id across.
 */
export function kbRecipeToRecipe(kbRecipe: KbRecipe): Omit<Recipe, "id"> {
    return {
        version: RECIPE_MODEL_VERSION,
        sourceId: kbRecipe.id,
        name: kbRecipe.name,
        brewer: kbRecipe.brewer,
        type: kbRecipe.type,
        description: kbRecipe.description,
        batchSize: kbRecipe.batchSize,
        efficiency: kbRecipe.efficiency,
        boilTime: kbRecipe.boilTime,
        targets: {
            og: kbRecipe.targets.og,
            fg: kbRecipe.targets.fg,
            abv: kbRecipe.targets.abv,
            ibu: kbRecipe.targets.ibu,
            srm: kbRecipe.targets.srm,
        },
        mash: kbRecipeMashToMash(kbRecipe.mash),
        boil: kbRecipeBoilToBoil(kbRecipe.boil),
        grains: kbRecipeGrainsToGrains(kbRecipe.grains),
        hops: kbRecipeHopsToHops(kbRecipe.hops),
        yeasts: kbRecipeYeastsToYeasts(kbRecipe.yeasts),
        additives: kbRecipeAdditivesToAdditives(kbRecipe.additives),
        equipment: kbRecipeEquipmentToEquipment(kbRecipe.equipment),
    };
}
