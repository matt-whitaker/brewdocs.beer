import {phasesFromBrewable} from "@/actions/deriveBatchPhases";
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
 * Re-derives a batch's `phases` (per-phase equipment) from `batch.brewable` on
 * every edit save. Shopping/schedule/summary read the brewable directly now, so
 * `phases` is the only legacy-shaped field left to keep in sync — its equipment
 * is rebuilt fresh, then brew-day `completed` checkoff is carried over by name.
 */
export default function _projectBatchBrewable(batch: Batch): Batch {
    return Object.assign(batch, {
        phases: phasesFromBrewable(batch.phases, batch.brewable)
            .map((phase, i) => preserveCompleted(phase, batch.phases[i]))
    });
}
