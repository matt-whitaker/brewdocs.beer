import {indexedResourcesOf} from "@/actions/brewableResources";
import {ScheduleItem, SchedulePhase, ScheduleKind} from "@/model/batch";
import Brewable, {Assignment} from "@/model/brewable";

/** keeps the pair a mutable tuple — `as const` would infer it readonly */
const tags = (phase: SchedulePhase, kind: ScheduleKind): [SchedulePhase, ScheduleKind] => [phase, kind];

/**
 * The grains to add during the mash, listed once with their weight. There's no
 * mash-step content in the brewable anymore, so there's no temperature to write
 * through — the row is a plain checklist entry (empty `path`).
 */
function mash(assignments: Assignment[]): ScheduleItem[] {
    return indexedResourcesOf(assignments, "grain").map(([grain, , id]) => ({
        id,
        name: grain.name,
        tags: tags("mash", "grains"),
        amount: grain.weight,
        path: ""
    }));
}

/**
 * Hops are listed once with their own boil timing rather than repeated per boil
 * step — `hop.boil` already says when each addition goes in, so iterating the
 * boil steps around them (as the old screen did) just duplicated every row.
 *
 * The `path` writes through to the assignment in the brewable
 * (`brewable.assignments[i].resource.boil`) — the editing source of truth, so a
 * boil-time edit from this screen is never a copy that could go stale. Paths are
 * relative to the *batch*, since that's what the screen's `useJsonEdit<Batch>`
 * reads and writes.
 */
function boil(assignments: Assignment[]): ScheduleItem[] {
    return [
        ...indexedResourcesOf(assignments, "hop").map(([hop, i, id]) => ({
            id,
            name: hop.name,
            tags: tags("boil", "hops"),
            note: hop.alpha.value,
            amount: hop.weight,
            path: `brewable.assignments[${i}].resource.boil`
        })),
        ...indexedResourcesOf(assignments, "additive").map(([additive, i, id]) => ({
            id,
            name: additive.name,
            tags: tags("boil", "additives"),
            path: `brewable.assignments[${i}].resource.boil`
        }))
    ];
}

/**
 * The yeast's pitch date is a brew-day event, not a step of its own, so it
 * rides behind the expander as an `extra` — tracker-backed (no `path`), keyed
 * off this same row's assignment ref (`model/tracker.ts`). That's also what
 * lets more than one yeast track its own pitch date, instead of sharing one
 * batch-wide field.
 */
function ferment(assignments: Assignment[]): ScheduleItem[] {
    return indexedResourcesOf(assignments, "yeast").map(([yeast, i, id]) => ({
        id,
        name: yeast.name,
        tags: tags("ferment", "yeasts"),
        path: `brewable.assignments[${i}].resource.temp`,
        extra: [{ name: "Yeast Pitched", input: "date" as const }]
    }));
}

/**
 * Derives the flat brew schedule from the brewable's ingredients — a **pure
 * view**, computed live by BatchSchedule rather than stored on the batch.
 *
 * Each item's `id` is its source assignment's id (stable across a Planning
 * rename/reorder), which is also the tracker ref the row computes for its
 * checkoff/actual/pitch date (`batch.tracker`, keyed by
 * `key({on:"assignment", id})` — see CLAUDE.md's BatchSchedule). Schedule items
 * carry no user-owned state of their own, so there's nothing to re-attach
 * across a rebuild: the caller memoizes on `brewable` and that's the whole
 * cache story.
 */
export default function deriveSchedule(brewable: Brewable): ScheduleItem[] {
    const assignments = brewable?.assignments ?? [];

    return [
        ...mash(assignments),
        ...boil(assignments),
        ...ferment(assignments)
    ];
}
