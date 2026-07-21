import Equipment from "@/model/equipment";
import {ChecklistItem} from "@/model/batch";

/**
 * Map a catalog equipment entry to a phase's checklist-item shape, setting defaults.
 * Called at the point equipment is added to a phase, not at any load/cache time.
 */
export function equipmentToChecklistItem(equipment: Equipment): ChecklistItem {
    return {
        name: equipment.name,
        completed: false,
    };
}
