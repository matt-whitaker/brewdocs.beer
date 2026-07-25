import {KbBrewablePhase} from "@brewdocs.beer/kb";
import Equipment, {EquipmentUses} from "@/model/equipment";

// Sole caller is now kbBrewableToBrewable (a phase's equipment) — the recipe's
// flat `equipment` array it also served was removed in #196.
export function kbRecipeEquipmentToEquipment(equipment: KbBrewablePhase["equipment"]): Equipment[] {
    return equipment.map(({name, use, count}) => ({
        name,
        use: use as EquipmentUses[],
        count
    }));
}
