import {KbRecipe} from "@brewdocs.beer/kb";
import Yeast from "@/model/yeast";

// kb and app now share the Scalar type, so a recipe's embedded yeasts already
// match the app Yeast shape — no per-field conversion needed.
export function kbRecipeYeastsToYeasts(yeasts: KbRecipe["yeasts"]): Yeast[] {
    return yeasts;
}