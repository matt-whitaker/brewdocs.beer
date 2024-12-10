import Grain from "@/model/grain";
import {Mash} from "@/model/mash";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import Measurements from "@/model/measurements";
import Equipment from "@/model/equipment";
import Boil from "@/model/boil";
import ChecklistDefinition from "@/model/checklist-definition";
import Additive from "@/model/additive";
import {Entity} from "@brewdocs.beer/core";
import Scalar from "@/model/scalar";

export default interface Recipe extends Entity {
    name: string;
    brewer: string;
    type: string;
    batchSize: Scalar;
    efficiency: Scalar;
    description: string;
    boilTime: Scalar;
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