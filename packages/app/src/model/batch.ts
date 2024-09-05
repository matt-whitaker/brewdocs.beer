import Measurements from "@/model/measurements";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";
import {Entity, Named} from "@/model/type";
import {BatchChecklist} from "@/model/batch-checklist";
import ShoppingList from "@/model/shopping-list";

export type NotInBatch = "id"|"targets"|"description"|"type"|"equipment"|"checklist";
export default interface Batch extends Entity, Omit<Recipe, NotInBatch> {
    name: string;
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Measurements;
    hydrometer: Hydrometer[];
    checklist: BatchChecklist[];
    shopping: ShoppingList[];
    notes?: string;
}

export const NOT_IN_BATCH: NotInBatch[] = ["id", "targets", "description", "type", "equipment", "checklist"]