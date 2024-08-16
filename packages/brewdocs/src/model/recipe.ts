import {Entity} from "@brewdocs/model/entity";
import Grain from "@brewdocs/model/grain";
import {Mash} from "@brewdocs/model/mash";
import Hop from "@brewdocs/model/hop";
import Yeast from "@brewdocs/model/yeast";
import Water from "@brewdocs/model/water";
import Vitals from "@brewdocs/model/vitals";

export default interface Recipe extends Entity {
    name: string;
    batchSize: number;
    boilTime: number;
    type?: string;
    brewer?: string;
    description?: string;
    batchNumber?: number;
    efficiency?: number;
    notes?: string;

    grain: Grain[];
    hops: Hop[];
    yeast: Yeast[];

    water: Water[];
    mash: Mash[];
    targets: Vitals;

    cost: {
        grains: number;
        hops: number;
        yeast: number;
        other: number;
    }
}