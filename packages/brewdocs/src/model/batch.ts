import {Entity} from "@brewdocs/model/entity";
import Grain from "@brewdocs/model/grain";
import {Mash} from "@brewdocs/model/mash";
import Hop from "@brewdocs/model/hop";
import Yeast from "@brewdocs/model/yeast";
import Water from "@brewdocs/model/water";
import Vitals from "@brewdocs/model/vitals";
import Hydrometer from "@brewdocs/model/Hydrometer";

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