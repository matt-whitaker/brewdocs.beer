import Batch, {Phase, SchedulePhase} from "@/model/batch";
import Brewable, {Assignment, ResourceType} from "@/model/brewable";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";

const SCHEDULE_PHASES: SchedulePhase[] = ["mash", "boil", "ferment"];

/**
 * The concrete resource model an Assignment narrows to for a given `resourceType`
 * — `ResourceFor<"hop">` is `Hop`, etc. Needed because TypeScript won't resolve
 * `Extract<Assignment, {resourceType: T}>["resource"]` to a single type while `T`
 * is an unbound generic, so the helpers below widen back to the union without an
 * explicit return annotation (this bit `weighed`, which needs `weight`).
 */
type ResourceFor<T extends ResourceType> = Extract<Assignment, { resourceType: T }>["resource"];

/** narrows an Assignment's `resource` by `resourceType`, matching the discriminated union */
export function resourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): ResourceFor<T>[] {
    return assignments
        .filter((assignment): assignment is Extract<Assignment, { resourceType: T }> => assignment.resourceType === resourceType)
        .map(assignment => assignment.resource as ResourceFor<T>);
}

/**
 * Like `resourcesOf`, but pairs each narrowed resource with its index in the
 * *flat* `assignments` array — so `_updateSchedule` can emit write-through paths
 * (`brewable.assignments[i].resource.boil`) that edit the real assignment in
 * place. The index is the position in the whole list, not within the type.
 */
export function indexedResourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): [ResourceFor<T>, number][] {
    return assignments
        .map((assignment, index) => [assignment, index] as const)
        .filter((pair): pair is [Extract<Assignment, { resourceType: T }>, number] => pair[0].resourceType === resourceType)
        .map(([assignment, index]) => [assignment.resource as ResourceFor<T>, index]);
}

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
 * Projects `brewable` (already built by createBatch — a clone for a user
 * recipe, kbBrewableToBrewable's output for a kb one) onto the legacy fields
 * the existing batch derivations read.
 */
export default function _updateRecipe(brewable: Brewable, batch: Partial<Batch>) {
    return Object.assign(batch, {
        grains: resourcesOf(brewable.assignments, "grain"),
        hops: resourcesOf(brewable.assignments, "hop"),
        yeasts: resourcesOf(brewable.assignments, "yeast"),
        additives: resourcesOf(brewable.assignments, "additive"),
        phases: phasesFromBrewable(batch.phases ?? [], brewable),
    });
}
