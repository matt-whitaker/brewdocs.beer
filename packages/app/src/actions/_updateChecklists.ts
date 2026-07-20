import {KbRecipe} from "@brewdocs.beer/kb";
import equipment from "@/data/equipment";
import {intersection} from "@/utils/func";
import Batch from "@/model/batch";

/**
 * Checklist definitions live on the recipe rather than the batch, so the recipe
 * comes in alongside it — same shape as _updateRecipe.
 */
export default function _updateChecklists(recipe: KbRecipe, batch: Partial<Batch>): Partial<Batch> {
    return Object.assign(batch, {
        checklists: recipe.checklist.map(({ name, uses }) => ({
            name,
            items: equipment
                .filter(({ use }) => !!intersection(uses, use).length)
                .map((ment) => ({ completed: false, name: ment.name }))
        }))
    });
}
