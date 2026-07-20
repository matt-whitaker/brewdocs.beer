import equipment from "@/data/equipment";
import {intersection} from "@/utils/func";
import Batch from "@/model/batch";

export default function _updateChecklists(batch: Partial<Batch>): Batch {
    return Object.assign(batch, {
        checklists: (recipe.checklist.map(({ name, uses }) => ({
            name,
            items: equipment
                .filter(({ use }) => !!intersection(uses, use).length)
                .map((ment) => ({ completed: false, name: ment.name }))
        }))),
    })
}