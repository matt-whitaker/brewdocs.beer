import Measurements from "@/model/measurements";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";
import {Named} from "@/model/type";

export default interface Batch extends Named, Omit<Recipe, "targets"|"description"|"type"|"equipment"|"checklist"> {
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Measurements;
    hydrometer: Hydrometer[];

    recipe: Recipe|null;
    notes?: string;
    checklist: Record<string, boolean>
}