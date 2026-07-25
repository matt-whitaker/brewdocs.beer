import {KbRecipe} from "@brewdocs.beer/kb";
import _updateSchedule from "@/actions/_updateSchedule";
import _updateShopping from "@/actions/_updateShopping";
import deriveBatchPhases from "@/actions/deriveBatchPhases";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import defaultBatch from "@/data/defaultBatch";
import Batch from "@/model/batch";
import Recipe, {RecipeSource} from "@/model/recipe";
import Statuses from "@/model/statuses";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";
import {cloneDeep} from "@/utils/func";

export default async function createBatch(recipe: Recipe | KbRecipe, source: RecipeSource, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    // a user recipe already has a brewable of its own; a kb recipe's brewable needs narrowing to the app shape
    const brewable = source === "user" ? cloneDeep((recipe as Recipe).brewable) : kbBrewableToBrewable((recipe as KbRecipe).brewable);

    const batch: Partial<Batch> = {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,
        recipeSource: source,
        brewable,
        ...inputs
    };

    deriveBatchPhases(brewable, batch);
    _updateShopping(batch);
    _updateSchedule(batch);

    // the pipeline above populates every required field, so it's a Batch by here
    await saveBatch(id, batch as Batch);

    return id;
}
