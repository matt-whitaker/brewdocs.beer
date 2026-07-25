import {byResourceType, projectHopPhase} from "@/actions/_projectRecipeBrewable";
import {phasesFromBrewable, resourcesOf} from "@/actions/_updateRecipe";
import Batch, {Phase} from "@/model/batch";

/**
 * phasesFromBrewable rebuilds each phase's equipment fresh from the brewable
 * (always `completed: false`) — fine at createBatch time, but here the phase
 * already has brew-day checkoff state. Match the rebuilt equipment back to
 * the previous phase's by name and carry `completed` over.
 */
function preserveCompleted(phase: Phase, previous: Phase | undefined): Phase {
    const priorByName = new Map((previous?.equipment ?? []).map(item => [item.name, item]));

    return {
        ...phase,
        equipment: phase.equipment.map(item => {
            const prior = priorByName.get(item.name);
            return prior ? {...item, completed: prior.completed} : item;
        })
    };
}

/**
 * Rebuilds a batch's legacy grains/hops/yeasts/additives arrays and each
 * phase's equipment from `batch.brewable`, so shopping/schedule/summary —
 * which still read the legacy fields — stay in sync once brewable-driven
 * editing lands. Mirrors _projectRecipeBrewable, reusing _updateRecipe's
 * assignment/equipment mapping instead of rewriting it. mash/boil have no
 * Brewable equivalent and are left untouched, same as the recipe projection.
 */
export default function _projectBatchBrewable(batch: Batch): Batch {
    const {assignments} = batch.brewable;

    return Object.assign(batch, {
        grains: resourcesOf(assignments, "grain"),
        hops: byResourceType(assignments, "hop").map(assignment => ({
            ...assignment.resource,
            phase: projectHopPhase(assignment.resource, assignment.phaseType)
        })),
        yeasts: resourcesOf(assignments, "yeast"),
        additives: resourcesOf(assignments, "additive"),
        phases: phasesFromBrewable(batch.phases, batch.brewable)
            .map((phase, i) => preserveCompleted(phase, batch.phases[i]))
    });
}
