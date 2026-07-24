import Additive from "@/model/additive";
import Equipment from "@/model/equipment";
import Grain from "@/model/grain";
import Hop from "@/model/hop";
import Yeast from "@/model/yeast";

/** the brew-day stage a phase or assignment belongs to */
export type PhaseType = "mash" | "boil" | "ferment";
/** which element model an Assignment's `resource` narrows to */
export type ResourceType = "grain" | "hop" | "yeast" | "additive";

/**
 * One slot in the schedule. Distinct from `model/batch.ts`'s `Phase` (a
 * different, batch-derived shape) — named `BrewablePhase` to avoid colliding.
 */
export interface BrewablePhase {
    type: PhaseType;
    equipment: Equipment[];
}

export interface Schedule {
    phases: BrewablePhase[];
}

interface AssignmentBase {
    phaseType: PhaseType;
    /** identifies the resource within its catalog/collection */
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

const PHASE_TYPES: PhaseType[] = ["mash", "boil", "ferment"];

/** one empty phase of each type and no assignments — satisfies the "≥1 of each" rule by construction */
export const defaultBrewable = (): Brewable => ({
    schedule: {
        phases: PHASE_TYPES.map(type => ({type, equipment: []}))
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
    const sameType = schedule.phases.filter(phase => phase.type === target.type);
    return sameType.length > 1;
};

/** resource's display name — also proves Assignment narrows `resource` correctly per `resourceType` when switched on */
export const assignmentResourceName = (assignment: Assignment): string => {
    switch (assignment.resourceType) {
        case "grain":
            return assignment.resource.name; // narrowed to Grain
        case "hop":
            return assignment.resource.name; // narrowed to Hop
        case "yeast":
            return assignment.resource.name; // narrowed to Yeast
        case "additive":
            return assignment.resource.name; // narrowed to Additive
    }
};
