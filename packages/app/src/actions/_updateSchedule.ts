import {indexedResourcesOf} from "@/actions/brewableResources";
import Batch, {ScheduleItem, SchedulePhase, ScheduleKind} from "@/model/batch";
import {isEqual} from "@/utils/func";

/** keeps the pair a mutable tuple — `as const` would infer it readonly */
const tags = (phase: SchedulePhase, kind: ScheduleKind): [SchedulePhase, ScheduleKind] => [phase, kind];

/**
 * Compares every field but `id` (the reuse key itself): isEqual is key-count
 * sensitive, so an absent `note` vs an explicit `note: undefined` would read as
 * a difference and defeat the reuse below.
 */
const sameDerived = (a: ScheduleItem, b: ScheduleItem) =>
    a.name === b.name
    && a.path === b.path
    && a.note === b.note
    && isEqual(a.tags, b.tags)
    && isEqual(a.amount, b.amount)
    && isEqual(a.extra, b.extra);

/**
 * The grains to add during the mash, listed once with their weight. There's no
 * mash-step content in the brewable anymore, so there's no temperature to write
 * through — the row is a plain checklist entry (empty `path`).
 */
function mash(batch: Partial<Batch>): ScheduleItem[] {
    return indexedResourcesOf(batch.brewable?.assignments ?? [], "grain").map(([grain, , id]) => ({
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
 * boil-time edit from this screen is never a copy that could go stale.
 */
function boil(batch: Partial<Batch>): ScheduleItem[] {
    const assignments = batch.brewable?.assignments ?? [];
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
function ferment(batch: Partial<Batch>): ScheduleItem[] {
    return indexedResourcesOf(batch.brewable?.assignments ?? [], "yeast").map(([yeast, i, id]) => ({
        id,
        name: yeast.name,
        tags: tags("ferment", "yeasts"),
        path: `brewable.assignments[${i}].resource.temp`,
        extra: [{ name: "Yeast Pitched", input: "date" as const }]
    }));
}

/**
 * Rebuilds the flat brew schedule from the batch's ingredients.
 *
 * Each item's `id` is its source assignment's id — stable across a Planning
 * rename/reorder, so it's the reuse key here (matching this rebuild's items
 * against the previous list) and, on the screen, the tracker ref the row
 * computes for its checkoff/actual/pitch date (`batch.tracker`, keyed by
 * `key({on:"assignment", id})` — see CLAUDE.md's BatchSchedule). When nothing
 * this action owns has changed, the *previous object* is handed back by
 * reference, which keeps updateBatch's isEqual check cheap and stops an
 * untouched schedule from looking dirty on every save.
 */
export default function _updateSchedule(batch: Partial<Batch>): Partial<Batch> {
    const previous = new Map((batch.schedule ?? []).map(item => [item.id, item]));

    const derived: ScheduleItem[] = [
        ...mash(batch),
        ...boil(batch),
        ...ferment(batch)
    ];

    return Object.assign(batch, {
        schedule: derived.map(item => {
            const prior = previous.get(item.id);
            // derived data untouched → hand back the same object
            return prior && sameDerived(prior, item) ? prior : item;
        })
    });
}
