import Equipment from "@/model/equipment";
import {ScheduleItem, SchedulePhase} from "@/model/batch";

/**
 * Map a catalog equipment entry to a phase's equipment-item shape, setting defaults.
 * Called at the point equipment is added to a phase, not at any load/cache time.
 */
export function equipmentToScheduleItem(equipment: Equipment, phase: SchedulePhase): ScheduleItem {
    return {
        name: equipment.name,
        tags: [phase, "equipment"],
        path: "",
        completed: false,
    };
}
