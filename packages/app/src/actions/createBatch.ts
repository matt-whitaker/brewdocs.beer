import Recipe from "@/model/recipe";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import batchesStorage from "@/storage/batches";
import Batch from "@/model/batch";
import equipment from "@/data/equipment";
import {cloneDeep, intersection} from "@/utils/func";
import defaultBatch from "@/data/defaultBatch";
import _updateShopping from "@/actions/_updateShopping";
import Statuses from "@/model/statuses";
import queryClient from "@/queryClient";
import {batchesQueryKey} from "@/state/batches";

export default async function createBatch(recipe: Recipe, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    let batch: Batch= {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,

        hops: cloneDeep(recipe.hops),
        grains: cloneDeep(recipe.grains),
        yeast: cloneDeep(recipe.yeast),
        additives: cloneDeep(recipe.additives),
        mash: cloneDeep(recipe.mash),
        boil: cloneDeep(recipe.boil),

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

    await batchesStorage.save(id, batch);
    await queryClient.invalidateQueries({queryKey: batchesQueryKey});

    return id;
}