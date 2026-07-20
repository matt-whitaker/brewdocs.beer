import {KbRecipe} from "@brewdocs.beer/kb";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import batchesStorage from "@/storage/batches";
import Batch from "@/model/batch";
import defaultBatch from "@/data/defaultBatch";
import _updateShopping from "@/actions/_updateShopping";
import Statuses from "@/model/statuses";
import {saveBatch} from "@/state/batches";
import _updateSchedule from "@/actions/_updateSchedule";
import _updateRecipe from "@/actions/_updateRecipe";
import _updateChecklists from "@/actions/_updateChecklists";

export default async function createBatch(recipe: KbRecipe, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    let batch: Partial<Batch> = {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,
        ...inputs
    }

    _updateRecipe(recipe, batch);
    _updateShopping(batch);
    _updateSchedule(batch);
    _updateChecklists(recipe, batch);

    // the pipeline above populates every required field, so it's a Batch by here
    await saveBatch(id, batch as Batch);

    return id;
}
