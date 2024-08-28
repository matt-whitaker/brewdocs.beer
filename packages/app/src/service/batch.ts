import Batch from "@/model/batch";
import recipeService from "@/service/recipe";

export class BatchService {
    async get(batchId: string): Promise<Batch|null> {
        const batch = (await this.list()).find(({ id }: Batch) => id === batchId) ?? null;
        if (batch) batch.recipe = await recipeService.get(batch.recipeId);

        return batch;
    }

    async list(): Promise<Batch[]> {
        const recipesMap = (await recipeService.list()).reduce((m, r) => m.set(r.id, r), new Map());
        const batches = (await import("@/data/batches")).default;
        return batches.map(batch => {
            batch.recipe = recipesMap.get(batch.recipeId);
            return batch;
        });
    }
}

const batchService = new BatchService();
export default batchService;