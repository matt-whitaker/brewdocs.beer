import {Entity} from "@/model/entity";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Water from "@/model/water";
import Vitals from "@/model/vitals";
import Hydrometer from "@/model/Hydrometer";

export interface Batch extends Entity {
    recipeId: 0,
    brewDate: Date,
    grain: Grain[];
    mash: Mash[];
    hops: Hop[];
    yeast: Yeast[];
    water: Water[];
    actuals: Vitals;
    hydro: {
        ["pre"|"boil"|"racked"|"final"]?: Hydrometer;
    }
}