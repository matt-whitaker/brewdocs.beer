import Vitals from "@/model/vitals";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";
import {Named} from "@/model/type";

export default interface Batch extends Named, Omit<Recipe, "targets"|"description"|"type"|"equipment"> {
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Vitals;
    hydrometer: Hydrometer[];

    recipe?: Recipe;
    notes?: string;
}