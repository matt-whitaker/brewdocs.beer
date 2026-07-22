import {KbRecipe} from "@brewdocs.beer/kb";
import _updateRecipe from "@/actions/_updateRecipe";
import _updateSchedule from "@/actions/_updateSchedule";
import _updateShopping from "@/actions/_updateShopping";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import defaultBatch from "@/data/defaultBatch";
import Batch from "@/model/batch";
import Statuses from "@/model/statuses";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";

export default async function createBatch(recipe: KbRecipe, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    const batch: Partial<Batch> = {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,
        ...inputs
    };

    _updateRecipe(recipe, batch);
    _updateShopping(batch);
    _updateSchedule(batch);

    // the pipeline above populates every required field, so it's a Batch by here
    await saveBatch(id, batch as Batch);

    return id;
}
