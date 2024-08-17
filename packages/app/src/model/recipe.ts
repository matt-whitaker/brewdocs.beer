import {Entity} from "@/model/entity";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Water from "@/model/water";
import Vitals from "@/model/vitals";

export default interface Recipe extends Entity {
    name: string;
    batchSize: string;
    boilTime: string;
    type?: string;
    brewer?: string;
    description?: string;
    batchNumber?: number;
    efficiency?: string;
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