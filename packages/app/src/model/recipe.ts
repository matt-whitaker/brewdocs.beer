import {Entity, Named} from "@/model/type";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Measurements from "@/model/measurements";
import Equipment from "@/model/equipment";
import Boil from "@/model/boil";
import EquipmentChecklist from "@/model/equipemnt-checklist";

export default interface Recipe extends Entity, Named {
    brewer: string;
    type: string;
    batchSize: string;
    batchNumber: number;
    efficiency: string;
    description: string;
    boilTime: string;
    targets: Measurements;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeast: Yeast[];
    equipment: Equipment[];
    checklist: EquipmentChecklist[];
}