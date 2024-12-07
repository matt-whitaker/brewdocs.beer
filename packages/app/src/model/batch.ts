import Measurements from "@/model/measurements";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";
import {Entity} from "@brewdocs.beer/core";
import {Mash} from "@/model/mash";
import Boil from "@/model/boil";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Additive from "@/model/additive";

interface ShoppingListItem {
    name: string;
    cost: string;
    purchased: boolean;
    scalar?: string;
}

interface ShoppingList {
    name: string;
    items: ShoppingListItem[];
}

interface ChecklistItem {
    name: string;
    checked: boolean;
}

interface Checklist {
    name: string;
    items: ChecklistItem[];
}

export type NotInBatch = "id"|"targets"|"description"|"type"|"equipment"|"checklist";
export default interface Batch extends Entity {
    name: string;
    brewDate: string;
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";

    brewer?: string;
    batchSize: string;
    efficiency: string;
    boilTime: string;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeast: Yeast[];
    additives: Additive[];

    actuals: Measurements;
    hydrometer: Hydrometer[];
    checklists: Checklist[];
    shopping: ShoppingList[];

    notes?: string;
}

export const NOT_IN_BATCH: NotInBatch[] = ["id", "targets", "description", "type", "equipment", "checklist"]