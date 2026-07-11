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

export interface ShoppingListItem {
    name: string;
    cost: Scalar;
    purchased: boolean;
    scalar?: Scalar;
}

export interface ShoppingList {
    name: string;
    items: ShoppingListItem[];
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
    yeast: Yeast[];
    additives: Additive[];
    //adjuncts

    actuals: Measurements;
    hydrometer: Hydrometer[];
    checklists: Checklist[];
    shopping: ShoppingList[];

    notes?: string;
}
