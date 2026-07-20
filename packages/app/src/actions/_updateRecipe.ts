import {KbRecipe} from "@brewdocs.beer/kb";
import Batch from "@/model/batch";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {kbRecipeGrainsToGrains} from "@/transform/kbRecipeGrainsToGrains";
import {kbRecipeYeastsToYeasts} from "@/transform/kbRecipeYeastsToYeasts";
import {kbRecipeAdditivesToAdditives} from "@/transform/kbRecipeAdditivesToAdditives";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";


export default function _updateRecipe(recipe: KbRecipe, batch: Partial<Batch>) {
    return Object.assign(batch, {
        hops: kbRecipeHopsToHops(recipe.hops),
        grains: kbRecipeGrainsToGrains(recipe.grains),
        yeasts: kbRecipeYeastsToYeasts(recipe.yeasts),
        additives: kbRecipeAdditivesToAdditives(recipe.additives),
        mash: kbRecipeMashToMash(recipe.mash),
        boil: kbRecipeBoilToBoil(recipe.boil),
    })
}

