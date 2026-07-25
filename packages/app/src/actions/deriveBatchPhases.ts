import Batch, {Phase, SchedulePhase} from "@/model/batch";
import Brewable from "@/model/brewable";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";

const SCHEDULE_PHASES: SchedulePhase[] = ["mash", "boil", "ferment"];

/** the SchedulePhase a legacy Phase maps to, read off its own tags rather than its (renamable) name */
const phaseTypeOf = (phase: Phase): SchedulePhase | undefined =>
    phase.tags.find((tag): tag is SchedulePhase => (SCHEDULE_PHASES as string[]).includes(tag));

/** replaces each legacy phase's equipment with the matching brewable phase(s)' kit */
export function phasesFromBrewable(phases: Phase[], brewable: Brewable): Phase[] {
    return phases.map(phase => {
        const type = phaseTypeOf(phase);
        if (!type) return phase;

        return {
            ...phase,
            equipment: brewable.schedule.phases
                .filter(brewablePhase => brewablePhase.type === type)
                .flatMap(brewablePhase => brewablePhase.equipment)
                .map(item => equipmentToScheduleItem(item, type))
        };
    });
}

/**
 * Derives the batch's `phases` (per-phase equipment) from `brewable`.
 * Shopping/schedule/summary read the brewable directly now, so `phases` is the
 * one legacy-shaped field with no reader-side replacement yet — `createBatch`
 * runs this at instantiation and `_projectBatchBrewable` re-runs it on every
 * edit save.
 */
export default function deriveBatchPhases(brewable: Brewable, batch: Partial<Batch>) {
    return Object.assign(batch, {
        phases: phasesFromBrewable(batch.phases ?? [], brewable),
    });
}
