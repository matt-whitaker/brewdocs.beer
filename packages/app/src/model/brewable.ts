import Additive from "@/model/additive";
import Equipment from "@/model/equipment";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";
import {newId} from "@/utils/id";

/** the brew-day stage a phase or assignment belongs to */
export type PhaseType = "mash" | "boil" | "ferment" | "carbonation" | "conditioning";
/** which element model an Assignment's `resource` narrows to */
export type ResourceType = "grain" | "hop" | "yeast" | "additive";

/** the kind of reading a phase's milestone captures */
export type MilestoneKind = "gravity" | "volume" | "temperature" | "pressure" | "kegDate" | "bottleDate" | "water";

/**
 * A reading the brewer plans to take during a phase — *plan* config, not the
 * measurement. The value and date live in `batch.tracker`, keyed by
 * `{on:"milestone", id}` (see `model/tracker.ts`). Because it's plan
 * data it rides on the brewable, so a recipe can prescribe its own readings.
 */
export interface Milestone {
    id: string;
    label: string;
    kind: MilestoneKind;
}

/**
 * One phase in the schedule — the **plan's** unit of identity. Every phase
 * carries a stable `id` from the moment it's created (recipes and kb imports
 * included), because assignments and tracker refs point at a *specific phase
 * instance*, not at its type. Two "boil" phases are two distinct phases.
 */
export interface BrewablePhase {
    /** stable per-instance id — minted at creation everywhere (defaultBrewable, kbBrewableToBrewable, the add-row) */
    id: string;
    type: PhaseType;
    equipment: Equipment[];
    /** readings planned for this phase; values live in the batch's tracker */
    milestones: Milestone[];
}

export interface Schedule {
    phases: BrewablePhase[];
}

interface AssignmentBase {
    id?: string;

    phaseId: string;

    slug: string;
}

/** a resource placed into a phase — a discriminated union so switching on `resourceType` narrows `resource` */
export type Assignment = AssignmentBase & (
    | { resourceType: "grain"; resource: Grain }
    | { resourceType: "hop"; resource: Hop }
    | { resourceType: "yeast"; resource: Yeast }
    | { resourceType: "additive"; resource: Additive }
);

export default interface Brewable {
    schedule: Schedule;
    assignments: Assignment[];
}

export const RESOURCE_TYPES: ResourceType[] = ["grain", "hop", "yeast", "additive"];

export const PHASE_TYPES: PhaseType[] = ["mash", "boil", "ferment"];
export const OPTIONAL_PHASE_TYPES: PhaseType[] = ["carbonation", "conditioning"];

/** one empty phase of each type and no assignments — satisfies the "≥1 of each" rule by construction */
export const defaultBrewable = (): Brewable => ({
    schedule: {
        phases: PHASE_TYPES.map(type => ({id: newId(), type, equipment: [], milestones: []}))
    },
    assignments: []
});

/**
 * False when removing `schedule.phases[index]` would drop the last phase of
 * its type — the single source of truth for the "≥1 mash/boil/ferment" rule,
 * so screens don't re-implement it.
 */
export const canRemovePhase = (schedule: Schedule, index: number): boolean => {
    const target = schedule.phases[index];
    if (!target) {
        return false;
    }
    if (!PHASE_TYPES.includes(target.type)) {
        return true;
    }
    const sameType = schedule.phases.filter(phase => phase.type === target.type);
    return sameType.length > 1;
};

/** 1-based position + capitalized type, e.g. "1. Mash", "2. Boil" — numbering follows the phase's place in the list, so it renumbers on reorder (matches model/batch's phaseLabel) */
export const phaseLabel = (phases: BrewablePhase[], index: number): string => {
    const {type} = phases[index];
    return `${index + 1}. ${type[0].toUpperCase()}${type.slice(1)}`;
};

/** resource's display name — also proves Assignment narrows `resource` correctly per `resourceType` when switched on */
export const assignmentResourceName = (assignment: Assignment): string => {
    switch (assignment.resourceType) {
        case "grain":
            return assignment.resource.name;
        case "hop":
            return assignment.resource.name;
        case "yeast":
            return assignment.resource.name;
        case "additive":
            return assignment.resource.name;
    }
};

type ResourceFor<T extends ResourceType> = Extract<Assignment, { resourceType: T }>["resource"];

/** narrows an Assignment's `resource` by `resourceType`, matching the discriminated union */
export function resourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): ResourceFor<T>[] {
    return assignments
        .filter((assignment): assignment is Extract<Assignment, { resourceType: T }> => assignment.resourceType === resourceType)
        .map(assignment => assignment.resource as ResourceFor<T>);
}

/**
 * Like `resourcesOf`, but pairs each narrowed resource with its index in the *flat*
 * `assignments` array and with the assignment's own `id`, which `useSchedule` surfaces on
 * the schedule row as its tracker ref. The index is the position in the whole list, not
 * within the type. `id` is guaranteed present because ids are minted in the batch **write**
 * path (`ensureBrewableIds` in `createBatch`/`updateBatch`, batch brewables only), so any
 * stored batch has them.
 */
export function indexedResourcesOf<T extends ResourceType>(assignments: Assignment[], resourceType: T): [ResourceFor<T>, number, string][] {
    return assignments
        .map((assignment, index) => [assignment, index] as const)
        .filter((pair): pair is [Extract<Assignment, { resourceType: T }>, number] => pair[0].resourceType === resourceType)
        .map(([assignment, index]) => [assignment.resource as ResourceFor<T>, index, assignment.id!]);
}
