import batches from "@/data/batches";
import Batch from "@/model/batch";
import getRecipes from "@/service/getRecipes";

export default async function getBatches(): Promise<Batch[]> {
    const recipesMap = (await getRecipes()).reduce((m, r) => m.set(r.id, r), new Map());
    return batches.map(batch => {
        batch.recipe = recipesMap.get(batch.recipeId);
        return batch;
    });
}