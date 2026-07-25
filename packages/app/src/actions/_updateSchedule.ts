import {indexedResourcesOf, resourcesOf} from "@/actions/_updateRecipe";
import Batch, {ScheduleItem, SchedulePhase, ScheduleKind} from "@/model/batch";
import {isEqual} from "@/utils/func";

/** the fields this action owns; `completed` belongs to the user */
type Derived = Omit<ScheduleItem, "completed">;

/** keeps the pair a mutable tuple — `as const` would infer it readonly */
const tags = (phase: SchedulePhase, kind: ScheduleKind): [SchedulePhase, ScheduleKind] => [phase, kind];

/**
 * Compares the derived fields by name rather than the whole object: isEqual is
 * key-count sensitive, so an absent `note` vs an explicit `note: undefined`
 * would read as a difference and defeat the reuse below.
 */
const sameDerived = (a: Derived|ScheduleItem, b: Derived|ScheduleItem) =>
    a.name === b.name
    && a.path === b.path
    && a.note === b.note
    && isEqual(a.tags, b.tags)
    && isEqual(a.amount, b.amount)
    && isEqual(a.extra, b.extra);

/**
 * Keyed on phase:kind:name rather than on `path`, so reordering or removing an
 * ingredient doesn't shift every later item's identity and drop its checkoff.
 * The counter disambiguates genuine repeats — the same grain across two mash
 * steps, say — which would otherwise collide and share one checkbox.
 */
function keyer() {
    const seen = new Map<string, number>();
    return ({ tags, name }: Derived|ScheduleItem) => {
        const key = `${tags[0]}:${tags[1]}:${name}`;
        const n = seen.get(key) ?? 0;
        seen.set(key, n + 1);
        return n ? `${key}#${n}` : key;
    };
}

/**
 * The grains to add during the mash, listed once with their weight. There's no
 * mash-step content in the brewable anymore, so there's no temperature to write
 * through — the row is a plain checklist entry (empty `path`).
 */
function mash(batch: Partial<Batch>): Derived[] {
    return resourcesOf(batch.brewable?.assignments ?? [], "grain").map(grain => ({
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
 * (`brewable.assignments[i].resource.boil`) — the editing source of truth — so a
 * boil-time edit from this screen survives `_projectBatchBrewable`, which rebuilds
 * the legacy `batch.hops` from the brewable on every save.
 */
function boil(batch: Partial<Batch>): Derived[] {
    const assignments = batch.brewable?.assignments ?? [];
    return [
        ...indexedResourcesOf(assignments, "hop").map(([hop, i]) => ({
            name: hop.name,
            tags: tags("boil", "hops"),
            note: hop.alpha.value,
            amount: hop.weight,
            path: `brewable.assignments[${i}].resource.boil`
        })),
        ...indexedResourcesOf(assignments, "additive").map(([additive, i]) => ({
            name: additive.name,
            tags: tags("boil", "additives"),
            path: `brewable.assignments[${i}].resource.boil`
        }))
    ];
}

function ferment(batch: Partial<Batch>): Derived[] {
    return indexedResourcesOf(batch.brewable?.assignments ?? [], "yeast").map(([yeast, i]) => ({
        name: yeast.name,
        tags: tags("ferment", "yeasts"),
        path: `brewable.assignments[${i}].resource.temp`,
        // when it went in matters less than what temperature to hold, so the date
        // sits behind the expander rather than taking a row of its own
        extra: [{ name: "Yeast Pitched", path: "pitchedDate", input: "date" as const }]
    }));
}

/** each entry is a slot in `batch.hydrometer`, in the order the readings are taken */
const READINGS: [index: number, phase: SchedulePhase][] = [
    [0, "mash"],
    [1, "boil"],
    [2, "ferment"]
];

/** exact date taken matters less than the reading itself, so it rides behind the row's expander, same as the yeast pitch date */
function gravity(batch: Partial<Batch>): Derived[] {
    return READINGS
        .filter(([i]) => (batch.hydrometer ?? [])[i])
        .map(([i, phase]) => ({
            name: batch.hydrometer![i].name,
            tags: tags(phase, "gravity"),
            path: `hydrometer[${i}].gravity`,
            extra: [{ name: "Reading Taken", path: `hydrometer[${i}].date`, input: "date" as const }]
        }));
}

/**
 * Rebuilds the flat brew schedule from the batch's ingredients and steps.
 *
 * Same contract as _updateShopping: items are matched against the previous list
 * so `completed` survives a recalculation, and when nothing this action owns has
 * changed the *previous object* is handed back by reference — which keeps
 * updateBatch's isEqual check cheap and stops an untouched schedule from looking
 * dirty on every save.
 */
export default function _updateSchedule(batch: Partial<Batch>): Partial<Batch> {
    const priorKey = keyer();
    const previous = new Map((batch.schedule ?? []).map(item => [priorKey(item), item]));

    const derived: Derived[] = [
        ...mash(batch),
        ...boil(batch),
        ...gravity(batch),
        ...ferment(batch)
    ];

    const nextKey = keyer();

    return Object.assign(batch, {
        schedule: derived.map((item): ScheduleItem => {
            const prior = previous.get(nextKey(item));

            if (!prior) return { ...item, completed: false };

            // derived data untouched → hand back the same object
            if (sameDerived(prior, item)) return prior;

            // derived data moved (a weight was edited, an index shifted) → refresh it, keep the checkoff
            return { ...prior, ...item };
        })
    });
}
