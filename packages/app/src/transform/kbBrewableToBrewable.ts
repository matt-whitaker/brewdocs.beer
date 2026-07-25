import {KbBrewable} from "@brewdocs.beer/kb";
import Brewable, {Assignment, BrewablePhase} from "@/model/brewable";
import {EquipmentUses} from "@/model/equipment";

/**
 * kb and app brewable shapes differ only in the loose-string unions
 * (`phase.type`, `assignment.phaseType`/`resourceType`, a phase equipment's
 * `use`), plus surplus kb-only resource fields (e.g. a hop's `phase`) the cast
 * simply drops, so this narrows via casts rather than rebuilding every field.
 */
export function kbBrewableToBrewable(kbBrewable: KbBrewable): Brewable {
    return {
        schedule: {
            phases: kbBrewable.schedule.phases.map((phase): BrewablePhase => ({
                type: phase.type as BrewablePhase["type"],
                equipment: phase.equipment.map(({name, use, count}) => ({
                    name,
                    use: use as EquipmentUses[],
                    count,
                }))
            }))
        },
        assignments: kbBrewable.assignments as Assignment[]
    };
}
