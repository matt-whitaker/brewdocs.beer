import Measurements from "@/model/measurements";
import Hydrometer from "@/model/hydrometer";
import {Entity} from "@brewdocs.beer/core";
import {Mash} from "@/model/mash";
import Boil from "@/model/boil";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Additive from "@/model/additive";
import Scalar from "@/model/scalar";
import Statuses from "@/model/statuses";

/** what an item was derived from; replaces the old shopping "groups" */
export type ShoppingTag = "hops"|"grains"|"yeasts"|"additives";

export interface ShoppingItem {
    name: string;
    /** derived — the first tag is the source ingredient type */
    tags: ShoppingTag[];
    /** derived — aggregate weight, absent for ingredients that aren't weighed */
    scalar?: Scalar;
    /** user-owned — preserved across recalculation */
    cost: Scalar;
    /** user-owned — preserved across recalculation */
    purchased: boolean;
}

export interface ChecklistItem {
    name: string;
    completed: boolean;
}

export interface Checklist {
    name: string;
    items: ChecklistItem[];
}

export default interface Batch extends Entity {
    name: string;
    brewDate: string;
    recipeId: string;
    status: Statuses;

    brewer?: string;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeasts: Yeast[];
    additives: Additive[];
    //adjuncts

    actuals: Measurements;
    hydrometer: Hydrometer[];
    checklists: Checklist[];
    shopping: ShoppingItem[];

    notes?: string;
}
