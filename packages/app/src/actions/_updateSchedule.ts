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
    && a.readonly === b.readonly
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

/** every grain goes in at each mash step's temperature, which the step owns */
function mash(batch: Partial<Batch>): Derived[] {
    return (batch.mash ?? []).flatMap((step, s) => (batch.grains ?? []).map(grain => ({
        name: grain.name,
        tags: tags("mash", "grains"),
        amount: grain.weight,
        path: `mash[${s}].temp`,
        readonly: true
    })));
}

/**
 * Hops are listed once with their own boil timing rather than repeated per boil
 * step — `hop.boil` already says when each addition goes in, so iterating the
 * boil steps around them (as the old screen did) just duplicated every row.
 */
function boil(batch: Partial<Batch>): Derived[] {
    return [
        ...(batch.hops ?? []).map((hop, i) => ({
            name: hop.name,
            tags: tags("boil", "hops"),
            note: hop.alpha.value,
            amount: hop.weight,
            path: `hops[${i}].boil`
        })),
        ...(batch.additives ?? []).map((additive, i) => ({
            name: additive.name,
            tags: tags("boil", "additives"),
            path: `additives[${i}].boil`
        }))
    ];
}

function ferment(batch: Partial<Batch>): Derived[] {
    return (batch.yeasts ?? []).map((yeast, i) => ({
        name: yeast.name,
        tags: tags("ferment", "yeasts"),
        path: `yeasts[${i}].temp`,
        // when it went in matters less than what temperature to hold, so the date
        // sits behind the expander rather than taking a row of its own
        extra: [{ name: "Yeast Pitched", path: "pitchedDate", input: "date" as const }]
    }));
}

/**
 * Only the brew-day readings; the primary/secondary ones happen days later.
 * "After boil" is taken once the wort is chilled, which is the tail end of the
 * boil phase rather than a stage of its own.
 */
const BREW_DAY_READINGS: [index: number, phase: SchedulePhase][] = [[0, "mash"], [1, "boil"]];

function gravity(batch: Partial<Batch>): Derived[] {
    return BREW_DAY_READINGS
        .filter(([i]) => (batch.hydrometer ?? [])[i])
        .map(([i, phase]) => ({
            name: batch.hydrometer![i].name,
            tags: tags(phase, "gravity"),
            path: `hydrometer[${i}].gravity`
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
