import {Entity} from "@brewdocs.beer/core";
import Additive from "@/model/additive";
import Boil from "@/model/boil";
import Equipment from "@/model/equipment";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import {Mash} from "@/model/mash";
import Measurements from "@/model/measurements";
import Scalar from "@/model/scalar";
import Yeast from "@/model/yeast";

/** current shape of the Recipe model; bump when a stored recipe would no longer parse correctly */
export const RECIPE_MODEL_VERSION = 1;

export default interface Recipe extends Entity {
    /** schema version the recipe was created under; see RECIPE_MODEL_VERSION */
    version: number;
    /** id of the KbRecipe this was cloned from, if any — kept for reference and to load the original (useKbRecipe(sourceId)) for review/reset; absent on recipes created from scratch */
    sourceId?: string;
    name: string;
    brewer: string;
    type: string;
    batchSize: Scalar;
    efficiency: Scalar;
    description: string;
    boilTime: Scalar;
    targets: Measurements;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeasts: Yeast[];
    additives: Additive[];
    equipment: Equipment[];
}
