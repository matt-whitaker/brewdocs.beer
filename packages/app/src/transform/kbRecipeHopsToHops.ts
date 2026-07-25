import {KbRecipe} from "@brewdocs.beer/kb";
import Hop from "@/model/hop";

/**
 * kb and app now share the Scalar type; a recipe's embedded hops carry every app
 * Hop field plus an extra kb-only `phase` string, so this is just a cast that
 * drops the surplus rather than a per-field conversion.
 */
export function kbRecipeHopsToHops(hops: KbRecipe["hops"]): Hop[] {
    return hops as Hop[];
}