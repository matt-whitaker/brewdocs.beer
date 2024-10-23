import {Entity} from "@/model/type";
import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Measurements from "@/model/measurements";
import Equipment from "@/model/equipment";
import Boil from "@/model/boil";
import ChecklistDefinition from "@/model/checklist-definition";
import Additive from "@/model/additive";

export default interface Recipe extends Entity {
    name: string;
    brewer: string;
    type: string;
    batchSize: string;
    efficiency: string;
    description: string;
    boilTime: string;
    targets: Measurements;

    mash: Mash[];
    boil: Boil[];
    grains: Grain[];
    hops: Hop[];
    yeast: Yeast[];
    additives: Additive[];
    equipment: Equipment[];

    checklist: ChecklistDefinition[];
}