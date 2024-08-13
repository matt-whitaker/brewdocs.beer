import {Entity} from "@brewdocs/model/entity";
import {Grain} from "@brewdocs/model/grain";
import {Mash} from "@brewdocs/model/mash";
import Hop from "@brewdocs/model/hop";
import Yeast from "@brewdocs/model/yeast";
import Water from "@brewdocs/model/water";
import Vitals from "@brewdocs/model/vitals";

export interface Batch extends Entity {
    grain: Grain[];
    mash: Mash[];
    hops: Hop[];
    yeast: Yeast[];
    water: Water[];
    actuals: Vitals;
}