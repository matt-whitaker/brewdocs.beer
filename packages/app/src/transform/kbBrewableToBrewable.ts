import {KbBrewable} from "@brewdocs.beer/kb";
import Brewable, {Assignment, BrewablePhase, PhaseType} from "@/model/brewable";
import {newId} from "@/utils/id";

/**
 * kb and app brewable shapes differ in the loose-string unions (`phase.type`,
 * `assignment.resourceType`) plus surplus kb-only resource fields (e.g. a hop's
 * `phase`) the cast simply drops.
 *
 * The one real conversion is **phase identity**. Authored kb JSON is
 * type-based — phases carry no ids and an assignment says `phaseType: "boil"` —
 * because hand-written data shouldn't contain uuids. The app needs *instance*
 * references so repeated phases of one type stay distinct, so this is where
 * that bridge happens: mint an id per phase, then resolve each assignment's
 * `phaseType` to the **first** phase of that type. Authoring a recipe with two
 * boil phases therefore lands every boil ingredient in the first of them; the
 * brewer moves them afterwards. Splitting them at authoring time would need the
 * kb format to name phases, which is a separate change.
 */
export function kbBrewableToBrewable(kbBrewable: KbBrewable): Brewable {
    const phases = kbBrewable.schedule.phases.map((phase): BrewablePhase => ({
        id: newId(),
        type: phase.type as PhaseType,
        equipment: phase.equipment.map(({name, notes}) => ({name, notes})),
        milestones: []
    }));

    const firstPhaseIdOfType = new Map<PhaseType, string>();
    phases.forEach(phase => {
        if (!firstPhaseIdOfType.has(phase.type)) {
            firstPhaseIdOfType.set(phase.type, phase.id);
        }
    });

    return {
        schedule: {phases},
        assignments: kbBrewable.assignments.map(({phaseType, ...assignment}) => ({
            ...assignment,
            // a kb phaseType with no matching phase would orphan the row, so fall
            // back to the first phase rather than emit a dangling reference
            phaseId: firstPhaseIdOfType.get(phaseType as PhaseType) ?? phases[0].id
        })) as Assignment[]
    };
}
