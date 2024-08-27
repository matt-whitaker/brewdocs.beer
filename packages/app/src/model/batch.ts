import Measurements from "@/model/measurements";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";
import {Named} from "@/model/type";
import {BatchChecklist} from "@/model/batch-checklist";
import ShoppingList from "@/model/shopping-list";

export default interface Batch extends Omit<Recipe, "targets"|"description"|"type"|"equipment"|"checklist"> {
    name: string;
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Measurements;
    hydrometer: Hydrometer[];
    checklist: BatchChecklist[];
    shopping: ShoppingList[];
    recipe: Recipe|null;
    notes?: string;
}