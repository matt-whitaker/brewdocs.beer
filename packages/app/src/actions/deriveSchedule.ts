import {ScheduleItem, ScheduleKind} from "@/model/batch";
import Brewable, {Assignment, ResourceType} from "@/model/brewable";

/** the schedule grouping each resource type falls under */
const KIND_OF: Record<ResourceType, ScheduleKind> = {
    grain: "grains",
    hop: "hops",
    yeast: "yeasts",
    additive: "additives"
};

/**
 * The row's **planned** secondary value: a hop/additive's boil time, a yeast's
 * pitch temperature. Grains have none — their weight is the whole plan.
 *
 * ⚠️ This is the plan, read-only to the brew-day screen. What actually happened
 * is recorded against the row's tracker entry (`actualDetail`), never written
 * back over the brewable — editing the plan is Planning's job.
 */
function detailFor(assignment: Assignment): ScheduleItem["detail"] {
    switch (assignment.resourceType) {
        case "grain":
            return undefined;
        case "hop":
        case "additive":
            return assignment.resource.boil;
        case "yeast":
            return assignment.resource.temp;
    }
}

/** the row's secondary fields, shown behind its expander */
function extraFor(assignment: Assignment): ScheduleItem["extra"] {
    // a yeast's pitch date is a brew-day event, not a step of its own — no `path`,
    // so it's tracker-backed, keyed off this row's own assignment ref
    return assignment.resourceType === "yeast"
        ? [{ name: "Yeast Pitched", input: "date" as const }]
        : undefined;
}

/** the headline planned amount, where the resource has one */
function amountFor(assignment: Assignment): ScheduleItem["amount"] {
    switch (assignment.resourceType) {
        case "grain":
        case "hop":
            return assignment.resource.weight;
        default:
            return undefined;
    }
}

/**
 * Derives the brew schedule from the brewable's assignments — a **pure view**,
 * computed live by BatchSchedule rather than stored on the batch.
 *
 * Each row is filed under the **phase instance its assignment points at**
 * (`assignment.phaseId`), not under a phase inferred from the resource type. That's
 * what lets two "boil" phases hold different hops, and it keeps this screen
 * agreeing with Planning, which groups by the same reference.
 *
 * A row's `id` is its source assignment's id (stable across a rename/reorder),
 * which is also the tracker ref the row computes for its checkoff/actual/pitch
 * date. Rows carry no user-owned state, so there's nothing to re-attach across a
 * rebuild: the caller memoizes on `brewable`, and that's the whole cache story.
 */
export default function deriveSchedule(brewable: Brewable): ScheduleItem[] {
    return (brewable?.assignments ?? []).map(assignment => ({
        id: assignment.id!,
        name: assignment.resource.name,
        phaseId: assignment.phaseId,
        kind: KIND_OF[assignment.resourceType],
        note: assignment.resourceType === "hop" ? assignment.resource.alpha.value : undefined,
        amount: amountFor(assignment),
        detail: detailFor(assignment),
        extra: extraFor(assignment)
    }));
}
