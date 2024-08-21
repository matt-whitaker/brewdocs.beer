import Vitals from "@/model/vitals";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";

export default interface Batch extends Omit<Recipe, "targets"|"description"|"type"|"equipment"> {
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Vitals;
    hydrometer: Hydrometer[];

    recipe?: Recipe;
    notes?: string;
}