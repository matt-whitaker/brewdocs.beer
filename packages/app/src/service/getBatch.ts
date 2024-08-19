import getBatches from "@/service/getBatches";
import Batch from "@/model/batch";
import getRecipe from "@/service/getRecipe";

export default async function getBatch(batchId: string): Promise<Batch> {
    const batch = (await getBatches()).find(({ id }: Batch) => id === batchId);
    if (batch) batch.recipe = await getRecipe(batch.recipeId);

    return batch;
}