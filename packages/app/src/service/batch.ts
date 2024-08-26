import Batch from "@/model/batch";
import batches from "@/data/batches";
import recipeService from "@/service/recipe";

export class BatchService {
    async get(batchId: string): Promise<Batch|null> {
        const batch = batches.find(({ id }: Batch) => id === batchId) ?? null;
        if (batch) batch.recipe = await recipeService.get(batch.recipeId);

        return batch;
    }

    async list(): Promise<Batch[]> {
        const recipesMap = (await recipeService.list()).reduce((m, r) => m.set(r.id, r), new Map());
        return batches.map(batch => {
            batch.recipe = recipesMap.get(batch.recipeId);
            return batch;
        });
    }
}

export default new BatchService();