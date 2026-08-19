import {KbRecipe} from "@brewdocs.beer/kb";
import _updateShopping from "@/actions/_updateShopping";
import ensureBrewableIds from "@/actions/ensureBrewableIds";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import defaultBatch from "@/data/defaultBatch";
import Batch from "@/model/batch";
import Recipe, {RecipeSource} from "@/model/recipe";
import {saveBatch} from "@/state/batches";
import batchesStorage from "@/storage/batches";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";
import {cloneDeep} from "@/utils/func";

export default async function createBatch(recipe: Recipe | KbRecipe, source: RecipeSource, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    const brewable = source === "user" ? cloneDeep((recipe as Recipe).brewable) : kbBrewableToBrewable((recipe as KbRecipe).brewable);
    ensureBrewableIds(brewable);

    const batch: Partial<Batch> = {
        ...defaultBatch(),
        id,
        recipeId: recipe.id,
        recipeSource: source,
        brewable,
        ...inputs
    };

    _updateShopping(batch);

    await saveBatch(id, batch as Batch);

    return id;
}
