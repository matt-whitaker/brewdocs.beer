import {KbRecipe} from "@brewdocs.beer/kb";
import Additive from "@/model/additive";
import Boil from "@/model/boil";
import Equipment from "@/model/equipment";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import {Mash} from "@/model/mash";
import Measurements from "@/model/measurements";
import Yeast from "@/model/yeast";

/** current shape of the Recipe model; bump when a stored recipe would no longer parse correctly */
export const RECIPE_MODEL_VERSION = 1;

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
    grains: Grain[];
    hops: Hop[];
    yeasts: Yeast[];
    additives: Additive[];
    mash: Mash[];
    boil: Boil[];
    equipment: Equipment[];
    targets: Measurements;
}
