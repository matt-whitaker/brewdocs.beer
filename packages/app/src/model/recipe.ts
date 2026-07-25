import {KbRecipe} from "@brewdocs.beer/kb";
import Brewable from "@/model/brewable";
import Measurements from "@/model/measurements";

/** which store a recipe lives in — the discriminator for a polymorphic recipe reference (paired with an id) */
export type RecipeSource = "kb" | "user";

/** current shape of the Recipe model; bump when a stored recipe would no longer parse correctly */
export const RECIPE_MODEL_VERSION = 2;

/**
 * The editable user recipe. It *is* a KbRecipe (same shared Scalar type), with
 * the ingredient/step string fields narrowed to the app's literal-union models,
 * plus local-only fields. Being a subtype of KbRecipe, a Recipe is usable
 * anywhere a KbRecipe is.
 */
export default interface Recipe extends KbRecipe {
    /** schema version the recipe was created under; see RECIPE_MODEL_VERSION */
    version: number;
    /** id of the KbRecipe this was cloned from, if any — kept for reference and to load the original (useKbRecipe(sourceId)) for review/reset; absent on recipes created from scratch */
    sourceId?: string;
    targets: Measurements;
    brewable: Brewable;
}
