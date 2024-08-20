import {Entity, Named} from "@/model/type";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Vitals from "@/model/vitals";
import Recipe from "@/model/recipe";
import Hydrometer from "@/model/hydrometer";

export default interface Batch extends Entity, Partial<Named> {
    recipeId: string;
    status: "prep"|"mash"|"boil"|"ferment"|"complete";
    actuals: Vitals;
    hydrometer: Hydrometer[];

    grain?: Grain[];
    mash?: Mash[];
    hops?: Hop[];
    yeast?: Yeast[];

    brewDate?: string;
    recipe?: Recipe;
    brewer?: string;
}