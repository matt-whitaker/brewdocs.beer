import {KbRecipe} from "@brewdocs.beer/kb";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import batchesStorage from "@/storage/batches";
import Batch from "@/model/batch";
import equipment from "@/data/equipment";
import {intersection} from "@/utils/func";
import defaultBatch from "@/data/defaultBatch";
import _updateShopping from "@/actions/_updateShopping";
import Statuses from "@/model/statuses";
import {saveBatch} from "@/state/batches";
import {kbRecipeHopsToHops} from "@/transform/kbRecipeHopsToHops";
import {kbRecipeYeastToYeast} from "@/transform/kbRecipeYeastToYeast";
import {kbRecipeAdditivesToAdditives} from "@/transform/kbRecipeAdditivesToAdditives";
import {kbRecipeMashToMash} from "@/transform/kbRecipeMashToMash";
import {kbRecipeBoilToBoil} from "@/transform/kbRecipeBoilToBoil";
import {kbRecipeGrainsToGrains} from "@/transform/kbRecipeGrainsToGrains";

export default async function createBatch(recipe: KbRecipe, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    let batch: Batch = {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,

        hops: kbRecipeHopsToHops(recipe.hops),
        grains: kbRecipeGrainsToGrains(recipe.grains),
        yeast: kbRecipeYeastToYeast(recipe.yeast),
        additives: kbRecipeAdditivesToAdditives(recipe.additives),
        mash: kbRecipeMashToMash(recipe.mash),
        boil: kbRecipeBoilToBoil(recipe.boil),

        // Generate the checklist based on the configured equipment
        checklists: (recipe.checklist.map(({ name, uses }) => ({
            name,
            items: equipment
                .filter(({ use }) => !!intersection(uses, use).length)
                .map((ment) => ({ completed: false, name: ment.name }))
        }))),
        shopping: [],

        // Inputs override all
        ...inputs
    }

    _updateShopping(batch);

    await saveBatch(id, batch)

    return id;
}
