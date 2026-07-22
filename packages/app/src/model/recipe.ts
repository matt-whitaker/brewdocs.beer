import {Entity} from "@brewdocs.beer/core";
import Additive from "@/model/additive";
import Boil from "@/model/boil";
import ChecklistDefinition from "@/model/checklist-definition";
import Equipment from "@/model/equipment";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import {Mash} from "@/model/mash";
import Measurements from "@/model/measurements";
import Scalar from "@/model/scalar";
import Yeast from "@/model/yeast";

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