import {EquipmentUses} from "@/model/equipment";

export default interface ChecklistDefinition {
    name: string;
    uses: EquipmentUses[];
}