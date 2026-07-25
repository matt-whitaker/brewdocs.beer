import {KbBrewable} from "@brewdocs.beer/kb";
import Brewable, {Assignment, BrewablePhase} from "@/model/brewable";
import {kbRecipeEquipmentToEquipment} from "@/transform/kbRecipeEquipmentToEquipment";

/**
 * kb and app brewable shapes differ only in the loose-string unions
 * (`phase.type`, `assignment.phaseType`/`resourceType`), plus surplus kb-only
 * resource fields (e.g. a hop's `phase`) the cast simply drops, so this narrows
 * via casts rather than rebuilding every field — mirrors kbRecipeHopsToHops.
 */
export function kbBrewableToBrewable(kbBrewable: KbBrewable): Brewable {
    return {
        schedule: {
            phases: kbBrewable.schedule.phases.map((phase): BrewablePhase => ({
                type: phase.type as BrewablePhase["type"],
                equipment: kbRecipeEquipmentToEquipment(phase.equipment)
            }))
        },
        assignments: kbBrewable.assignments as Assignment[]
    };
}
