import {KbRecipe} from "@brewdocs.beer/kb";
import Equipment, {EquipmentUses} from "@/model/equipment";

export function kbRecipeEquipmentToEquipment(equipment: KbRecipe["equipment"]): Equipment[] {
    return equipment.map(({name, use, count}) => ({
        name,
        use: use as EquipmentUses[],
        count
    }));
}
