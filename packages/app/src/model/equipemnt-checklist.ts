import {Named} from "@/model/type";
import {EquipmentUses} from "@/model/equipment";

export default interface EquipmentChecklist extends Named {
    uses: EquipmentUses[]
}