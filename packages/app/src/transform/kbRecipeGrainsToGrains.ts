import {KbRecipe} from "@brewdocs.beer/kb";
import Grain from "@/model/grain";

// kb and app now share the Scalar type, so a recipe's embedded grains already
// match the app Grain shape — no per-field conversion needed.
export function kbRecipeGrainsToGrains(grains: KbRecipe["grains"]): Grain[] {
    return grains;
}