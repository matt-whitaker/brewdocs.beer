import Batch, {NOT_IN_BATCH, NotInBatch} from "@/model/batch";
import State from "@/state/state";
import batchesStorage from "@/storage/batches";
import {cloneDeep, groupBy, intersection, omit, partition} from "lodash";
import Recipe from "@/model/recipe";
import equipment from "@/data/equipment";
import {ChecklistData} from "@/model/checklist-data";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import useObservableState from "@/state/useObservableState";
import Hop from "@/model/hop";
import {parseNumberString} from "@/utils/math";

export type BatchesTuple = [Batch[], Map<string, Batch>]|[null, null];
export const useBatches = () => useObservableState<BatchesTuple, [null, null]>(batchesState, [null, null]);

export class BatchesState extends State<BatchesTuple, [null, null]> {
    load() {
        batchesStorage.list()
            .then(batches => {
                const index = batches.reduce((m, r) => m.set(r.id, r), new Map());
                this._subject.next([batches, index]);
            });
    }

    async createFromRecipe(recipe: Recipe, inputs: CreateBatchState) {
        const id = await batchesStorage.generateId();

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
            })) as ChecklistData[]),

            shopping: [
                {
                    name: "Hops",
                    items: (() => {
                        const groups: Record<string, Hop[]> = groupBy(recipe.hops, "name");
                        return Object.keys(groups).map(hopName => {
                            const unit = parseNumberString(groups[hopName][0].weight)[1];
                            const weight = groups[hopName].reduce((m, v) => m+parseNumberString(v.weight)[0], 0.0)
                            return {
                                name: hopName,
                                purchased: false,
                                cost: "$0.00",
                                weight: `${weight}${unit}`
                            }
                        })
                    })()
                },
                {
                    name: "Grain",
                    items: recipe.grains.map(({ name, weight }) => ({
                        name,
                        weight,
                        purchased: false,
                        cost: "$0.00"
                    }))
                },
                {
                    name: "Yeast",
                    items: recipe.yeast.map(({ name }) => ({
                        name,
                        purchased: false,
                        cost: "$0.00"
                    }))
                },
                {
                    name: "Additives",
                    items: recipe.additives.map(({ name }) => ({
                        name,
                        purchased: false,
                        cost: "$0.00"
                    }))
                }
            ],

            // Clone the inheritable properties from the recipe
            ...(omit(cloneDeep(recipe), NOT_IN_BATCH) as Omit<Recipe, NotInBatch>),
            // Inputs override all
            ...inputs
        }

        batchesStorage.save(batch)
            .then(() => this.load());

        return id;
    }

    update(batch: Batch) {
        batchesStorage.save(batch)
            .then(() => this.load());
    }
}

const batchesState = new BatchesState([null, null]);
export default batchesState;