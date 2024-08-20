import {Entity, Named} from "@/model/type";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Vitals from "@/model/vitals";
import Equipment from "@/model/equipment";
import Boil from "@/model/boil";

export default interface Recipe extends Entity, Named {
    batchSize: string;
    batchNumber: number;
    boilTime: string;
    type: string;
    brewer: string;
    description: string;
    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeast: Yeast[];

    targets: Vitals;

    equipment?: Equipment[];
    efficiency?: string;
    notes?: string;
}