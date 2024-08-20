import Batch from "@/model/batch";
import getBatches from "@/service/getBatches";
import getRecipe from "@/service/getRecipe";
import {Service} from "@/service/service";

export class BatchService implements Service<Batch> {
    async get(batchId: string): Promise<Batch> {
        const batch = (await getBatches()).find(({ id }: Batch) => id === batchId);
        if (batch) batch.recipe = await getRecipe(batch.recipeId);

        return batch;
    }
}

export default new BatchService();