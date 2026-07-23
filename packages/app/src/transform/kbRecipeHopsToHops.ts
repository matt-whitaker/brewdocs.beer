import {KbRecipe} from "@brewdocs.beer/kb";
import Hop from "@/model/hop";

/**
 * kb and app now share the Scalar type; a recipe's embedded hops differ from the
 * app Hop only in `phase` (loose string vs the app's literal union), so this is
 * just a narrowing cast rather than a per-field conversion.
 */
export function kbRecipeHopsToHops(hops: KbRecipe["hops"]): Hop[] {
    return hops as Hop[];
}