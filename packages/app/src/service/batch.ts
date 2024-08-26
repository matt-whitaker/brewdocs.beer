import Batch from "@/model/batch";
import {Service} from "@/service/useService";
import batches from "@/data/batches";
import recipeService from "@/service/recipe";
import {BehaviorSubject, Subject} from "rxjs";

export class BatchService implements Service<Batch> {
    private _$ubject;
    private $ubject = new Subject<Batch>();

    private $update(batch: Batch) {
        if (!this._$ubject) {
            this._$ubject = new BehaviorSubject<Batch>(batch);
            this._$ubject.subscribe(this.$ubject);
        } else {
            this._$ubject.next(batch);
        }
    }

    subscribe(subscriber: (batch: Batch) => void) {
        this.$ubject.subscribe(subscriber);
    };

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