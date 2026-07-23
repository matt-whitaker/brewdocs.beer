import {KbRecipe} from "@brewdocs.beer/kb";
import Additive from "@/model/additive";

// kb and app now share the Scalar type, so a recipe's embedded additives already
// match the app Additive shape — no per-field conversion needed.
export function kbRecipeAdditivesToAdditives(additives: KbRecipe["additives"]): Additive[] {
    return additives;
}