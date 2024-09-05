import Batch, {NOT_IN_BATCH, NotInBatch} from "@/model/batch";
import State from "@/state/state";
import {useEffect, useState} from "react";
import batchesStorage from "@/storage/batches";
import {cloneDeep, intersection, omit} from "lodash";
import Recipe from "@/model/recipe";
import equipment from "@/data/equipment";
import {BatchChecklist} from "@/model/batch-checklist";

export type BatchesTuple = [Batch[], Map<string, Batch>]|[null, null];

export function useBatches(): BatchesTuple {
    const [state, setState] = useState<BatchesTuple>(batchesState.current || [null, null]);

    useEffect(() => {
        batchesState.subscribe((newState) => setState(newState));
        batchesState.load();
    }, []);

    return state as BatchesTuple;
}

export class BatchesState extends State<BatchesTuple> {
    load() {
        batchesStorage.list()
            .then(batches => {
                const index = batches.reduce((m, r) => m.set(r.id, r), new Map());
                this._subject.next([batches, index]);
            });
    }

    createFromRecipe(recipe: Recipe) {
        batchesStorage.generateId()
            .then((id) => {
                const batch: Batch = {
                    id,
                    recipeId: recipe.id,
                    status: "prep",
                    actuals: { og: "0.00", fg: "0.00", abv: "0.0%", ibu: "0", srm: "0" },
                    hydrometer: [],
                    checklist: (recipe.checklist.map((list) => ({
                        name: list.name,
                        items: equipment
                            .filter((ment) => !!intersection(list.uses, ment.use).length)
                            .map((ment) => ({ checked: false, name: ment.name }))
                    })) as BatchChecklist[]),
                    shopping: [],
                    ...(omit(cloneDeep(recipe), NOT_IN_BATCH) as Omit<Recipe, NotInBatch>)
                }

                return batchesStorage.save(batch)
                    .then(() => this.load());
            })

    }

    update(batch: Batch) {
        // do update
        batchesStorage.save(batch)
            .then(() => this.load());
    }
}

const batchesState = new BatchesState([null, null]);
export default batchesState;