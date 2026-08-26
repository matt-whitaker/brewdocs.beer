# MODELS.md

Field-by-field reference for the app's own models — [`src/model/`](src/model/). These are the
**user-owned, persisted** shapes: what a brewer creates, edits and keeps. They are the counterpart
to the kb catalog's read-only `Kb*` types, and several of them **narrow** from one — see
[_Narrowing from the kb catalog_](#narrowing-from-the-kb-catalog) below.

⚠️ **This file states shape. Mechanism and *why* stay in a `CLAUDE.md`** — the transform boundary,
the `__type` narrowing hazard, the tracker/timer write paths, the editing pattern. Where one of
those is involved, this file links to it rather than restating it.

Two references this file assumes rather than repeats:

- [`packages/core/MODELS.md`](../core/MODELS.md) — `Entity` (`id`/`version`, the persisted-record
  base) and `Scalar` (`{value, unit?, currency?}`, where `value` is the full display string
  including the unit). Every `Scalar` below is that one.
- [`packages/kb/CLAUDE.md`](../kb/CLAUDE.md) — the `Kb*` catalog types the models here narrow from.

## Narrowing from the kb catalog

An app model that has a kb counterpart is a **narrowing** of it, not a re-declaration. Three exist
today, and they do not all get there the same way:

| App model | Narrows | How |
|---|---|---|
| `Recipe` | `KbRecipe` | `extends` (structural) + [`transform/kbRecipeToRecipe.ts`](src/transform/kbRecipeToRecipe.ts) for kb-sourced instances |
| `UserEquipment` | `KbEquipment` | `extends` (structural), no transform function |
| `Brewable` | `KbBrewable` | **not** a TS `extends` — narrowed entirely by [`transform/kbBrewableToBrewable.ts`](src/transform/kbBrewableToBrewable.ts) (see [_The `Brewable` family_](#the-brewable-family)) |

⚠️ **`Brewable` is the odd one, and the difference is real rather than stylistic.** `Recipe` and
`UserEquipment` are declared as extending their kb types, so TypeScript itself holds the
relationship: a `Recipe` *is* a `KbRecipe` and is usable anywhere one is. `Brewable` is not
declared that way, because a kb brewable's fields are **loose strings** (`phase.type`,
`assignment.resourceType`) where the app's are **literal unions** — a subtype cannot widen an
inherited field, so `Brewable extends KbBrewable` would not compile. The relationship therefore
lives only in `kbBrewableToBrewable`: nothing in the type system connects the two, and nothing
checks that the transform stays faithful to both shapes. Changing either shape without changing
that function is a silent break.

⚠️ **Extending a kb type is not free either.** Because `Recipe extends KbRecipe`, the base's
`__type` has to admit its subtype's tag (`KbRecipe.__type` is `"kbRecipe" | "recipe"`, not a single
literal), and that makes `x.__type === "kbRecipe"` narrow only its *true* branch. The rule and its
consequence for call sites are in
[`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models).

## `Recipe`

The editable, user-owned recipe — the one persisted in the `recipes` store and read through
`useRecipe`/`saveRecipe`. Distinct from a catalog `KbRecipe`, which is read-only and flows through
the kb hooks untransformed.

```ts
interface Recipe extends KbRecipe {
    __type: "recipe";
    sourceId?: string;
    targets: Measurements;
    brewable: Brewable;
}
```

**A `Recipe` *is* a `KbRecipe`.** It does not copy the catalog shape — it extends it, so every
`KbRecipe` field (`name`, `brewer`, `description`, `type`, `batchSize`, `boilTime`, `efficiency`,
plus `Entity`'s `id`/`version`) is present here unchanged and with the same `Scalar` convention.
What the declaration above adds is the four lines a *user-owned* recipe needs on top: its own
discriminator tag, a link back to whatever it was cloned from, and two fields re-typed to the app's
own models. Anywhere a `KbRecipe` is accepted, a `Recipe` may be passed.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `__type` | `"recipe"` | yes | The discriminator, fixed to the single literal — this is a user recipe, never a catalog one. Set by `defaultRecipe` and by `kbRecipeToRecipe`. |
| `sourceId` | `string` | no | The `id` of the `KbRecipe` this was cloned from. Kept so the original can be loaded for review or reset (`useKbRecipe(sourceId)`). **Absent** on a recipe created from scratch. |
| `targets` | `Measurements` | yes | The recipe's intended OG/FG/ABV/IBU/SRM — what the brewer is aiming at. Structurally the same shape `KbRecipe.targets` declares inline; here it is the app's named [`Measurements`](#measurements) type. |
| `brewable` | `Brewable` | yes | The plan: phases, their equipment, and the ingredient assignments. Narrowed from `KbBrewable` — see [_The `Brewable` family_](#the-brewable-family). |

- ⚠️ **`sourceId` records provenance, not a live link.** Editing the recipe does not touch the kb
  original, and the kb original changing does not touch this recipe. A `sourceId` naming a kb recipe
  that no longer exists is not an error the type can catch.
- The brewable is the **only** place a recipe's ingredients and equipment live — there are no
  separate arrays beside it. See
  [`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models).
- A `Recipe` has **no** `brewDate` and no as-brewed values. Those are `Batch` facts.

### `RecipeSource`

```ts
type RecipeSource = "kb" | "user";
```

Which store a recipe lives in — the catalog (`"kb"`) or the user's own IndexedDB (`"user"`). It is
the discriminator half of a **polymorphic recipe reference**: an id alone is ambiguous, because the
two stores number their records independently, so a stored pointer to a recipe is always the pair
(`Batch.recipeId` + `Batch.recipeSource`).

## `Batch`

One brew: a recipe instantiated on a date, plus everything recorded while brewing it. Persisted in
the `batches` store, and the only domain wired into the migration framework today (see
[`packages/app/CLAUDE.md`, _Data compatibility_](CLAUDE.md#data-compatibility-versioned-entities--migration)).

```ts
interface Batch extends Entity {
    name: string;
    brewDate: string;
    packaging?: "keg" | "bottle";
    recipeId: string;
    recipeSource?: RecipeSource;
    recipeName?: string;
    recipeBrewer?: string;
    recipeDescription?: string;
    recipeTargets?: Measurements;
    brewable: Brewable;
    brewer?: string;
    batchSize: Scalar;
    efficiency: Scalar;
    boilTime: Scalar;
    actuals: Measurements;
    shopping: ShoppingItem[];
    tracker: Record<string, TrackerEntry>;
    timer?: TimerEvent[];
    notes?: BatchNotes;
}
```

`Batch` extends [`Entity`](../core/MODELS.md#entity) directly — it is **not** a narrowing of any
`Kb*` type. The catalog has no notion of a brew that happened.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What the brewer calls this batch. Defaults to the source recipe's name at creation; freely renamed afterwards. |
| `brewDate` | `string` | yes | The day it was brewed, as a **date-only** `YYYY-MM-DD` string — it is written by an `<input type="date">`. May be `""`: the create form leaves it empty unless the brewer fills it in, and it is set later on BatchSchedule's **Prep** tab. |
| `packaging` | `"keg" \| "bottle"` | no | How this batch was packaged. Absent until the brewer chooses; also edited on the **Prep** tab. |
| `recipeId` | `string` | yes | The id of the recipe this batch was made from. Ambiguous on its own — read it together with `recipeSource`. |
| `recipeSource` | [`RecipeSource`](#recipesource) | no | Which store `recipeId` refers to. Optional in the type; `createBatch` always sets it. |
| `recipeName` | `string` | no | The source recipe's own name, snapshotted at creation. Distinct from `name`, which is this batch's name and is renamable. Shown as the Summary tab's heading and as the batch page's recipe breadcrumb. |
| `recipeBrewer` | `string` | no | The source recipe's author — who wrote the recipe, **not** who brewed this batch (that is `brewer`). Shown as "By …" on Summary and Planning. |
| `recipeDescription` | `string` | no | The source recipe's description, shown on Summary. |
| `recipeTargets` | `Measurements` | no | The source recipe's target OG/FG/ABV/IBU/SRM, shown as Summary's **Target** vitals column and used as the gravity input to the estimated-IBU calc until a real OG reading exists. See [`Measurements`](#measurements). |
| `brewable` | `Brewable` | yes | This batch's **own copy** of the plan — a deep clone of the recipe's brewable for a user recipe, `kbBrewableToBrewable(kbRecipe.brewable)` for a kb one. Editing it in Planning never touches the recipe it came from. See [_The `Brewable` family_](#the-brewable-family). |
| `brewer` | `string` | no | Who brewed **this batch**. Nothing sets it at creation — `createBatch` never copies it from the recipe, and the create form has no field for it — so it is absent unless something else wrote it. The recipe's own author is `recipeBrewer`. |
| `batchSize` | `Scalar` | yes | Target volume — `{value: "5gal", unit: "gal"}` by default. |
| `efficiency` | `Scalar` | yes | Assumed mash efficiency — `{value: "75%", unit: "%"}` by default. |
| `boilTime` | `Scalar` | yes | Planned boil length — `{value: "60min", unit: "min"}` by default. |
| `actuals` | `Measurements` | yes | The as-brewed OG/FG/ABV/IBU/SRM. ⚠️ **No screen writes it** — the Summary tab shows a live value computed from `tracker` gravity readings instead, so what is stored here is the seeded placeholder (`"0.00°P"` etc.) unless something else set it. See [`Measurements`](#measurements). |
| `shopping` | `ShoppingItem[]` | yes | The shopping list — see [`ShoppingItem`](#shoppingitem). |
| `tracker` | `Record<string, TrackerEntry>` | yes | The brew-day overlay — checkoffs, actuals, readings, keyed by a stringified ref. See [_The tracker_](#the-tracker). |
| `timer` | `TimerEvent[]` | no | The brew-day timer's session log — see below. |
| `notes` | `BatchNotes` | no | Free-text notes plus an observed SRM — see [`BatchNotes`](#batchnotes). |

**`brewDate` and `packaging` are brew-day facts, and that is why a `Recipe` does not carry them.** A
recipe is a plan that can be brewed any number of times; the day it was brewed and how it was
packaged are true of one brew only. The same split explains why `batchSize`/`efficiency`/`boilTime`
appear on *both*: the recipe states the intent, the batch holds this brew's own value, and editing
one does not move the other.

**The `recipe*` fields are a snapshot, and a batch never reads its recipe live.** A recipe can be
deleted while a batch made from it is still around, so every recipe value a batch screen displays is
copied onto the batch at creation — the same reason `brewable`/`batchSize`/`efficiency`/`boilTime`
are already copied. They are optional because a batch created before they existed has none: there is
no migration that could fill them in (a `Migration.up` is a pure function of the one record and
cannot read the recipe store), so the screens omit what they have not got rather than showing a
blank heading or an empty Target column.

### `Batch.timer`

```ts
type TimerEventType = "start" | "pause" | "resume" | "stop";

interface TimerEvent {
    type: TimerEventType;
    date: string;
}
```

An **append-only session log** for the global brew timer — one array per batch, not a map keyed by
ids and not scoped to a phase (which is what makes it shaped unlike [`tracker`](#the-tracker)). Both
types live in [`src/model/timer.ts`](src/model/timer.ts).

| Field | Type | Required | Meaning |
|---|---|---|---|
| `type` | `TimerEventType` | yes | Which press this was — `"start"` the first one of the session, `"pause"`/`"resume"` a stop and restart of the clock, `"stop"` the end of it. |
| `date` | `string` | yes | When it was pressed, as a full absolute ISO timestamp. |

- ⚠️ **`date` is a real absolute ISO timestamp**, never a running duration or an offset. That is
  what lets a session sit paused for days and resume with no special case for the gap.
- Nothing accumulates a counter: elapsed time is recomputed from the timestamps, and whether the
  timer is running is read off the last event. Both helpers tolerate the field being absent or
  empty — that means "never started, zero elapsed". Per
  [_Data compatibility_](CLAUDE.md#data-compatibility-versioned-entities--migration) there is no
  backfill for batches stored before the field existed.
- The helpers and the screen that drives them are in
  [`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models) and
  _BatchSchedule screen_.

## `UserEquipment`

A piece of the brewer's own equipment — the user-owned counterpart to a catalog `KbEquipment`.

```ts
interface UserEquipment extends KbEquipment {
    __type: "equipment";
    sourceId?: string;
}
```

Two fields beyond `KbEquipment`, and the same pattern as `Recipe`: it **extends** the catalog type
rather than restating it, so `name`, `notes`, the optional `count` and `Entity`'s `id`/`version` all
carry over unchanged and a `UserEquipment` is usable anywhere a `KbEquipment` is. There is no
transform function — nothing needs narrowing, so the `extends` is the whole relationship.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `__type` | `"equipment"` | yes | The discriminator, fixed to the single literal. `KbEquipment.__type` is the union `"kbEquipment" \| "equipment"` for the same reason `KbRecipe`'s is — a base must admit its subtype's tag. |
| `sourceId` | `string` | no | The `id` of the `KbEquipment` this was cloned from, if any. Absent on equipment the brewer added from scratch. Provenance only, exactly as on `Recipe`. |

⚠️ **This is not the equipment a batch checks off.** A phase's equipment lives on the brewable
(`brewable.schedule.phases[].equipment`) and is checked off through `batch.tracker` — see
[`packages/app/CLAUDE.md`, _BatchSchedule screen_](CLAUDE.md#batchschedule-screen-configurable-phases).

## The `Brewable` family

The plan — phases, the equipment and readings each phase calls for, and the ingredients assigned to
them. Everything in this section lives in [`src/model/brewable.ts`](src/model/brewable.ts), and the
sections below follow that file's own declaration order: the closed unions first, then the pieces
they type, then `Brewable` itself.

⚠️ **A brewable is the plan's single source of truth** — there is no second ingredient array, no
second phase list, and no batch-level copy of the schedule beside it. The *why*, and the write paths
that maintain it, are in
[`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models); this section
states only the shape.

The file also holds pure functions over these types (`defaultBrewable`, `canRemovePhase`,
`phaseLabel`, `assignmentResourceName`, `resourcesOf`, `indexedResourcesOf`). They are behaviour, not
shape, and are documented in
[`packages/app/CLAUDE.md`, _Live computation_](CLAUDE.md#live-computation-srchooks-pure-functions-in-srcmodel).

### `PhaseType`, `ResourceType`, `MilestoneKind`

```ts
type PhaseType = "mash" | "boil" | "ferment" | "carbonation" | "conditioning";
type ResourceType = "grain" | "hop" | "yeast" | "additive";
type MilestoneKind = "gravity" | "volume" | "temperature" | "pressure" | "kegDate" | "bottleDate" | "water";
```

| Type | Meaning |
|---|---|
| `PhaseType` | The brew-day stage a phase belongs to. `"mash"`/`"boil"`/`"ferment"` are the three every brewable has at least one of; `"carbonation"`/`"conditioning"` are optional. |
| `ResourceType` | Which element model an `Assignment`'s `resource` narrows to — the discriminant of that union. |
| `MilestoneKind` | The kind of reading a phase's milestone captures. `"kegDate"`/`"bottleDate"` capture a date rather than a value; `"water"` captures a whole seven-parameter sample rather than a single reading. |

Three module constants restate those sets as runtime arrays, and the phase pair is **not** a single
list split for convenience:

```ts
const RESOURCE_TYPES: ResourceType[] = ["grain", "hop", "yeast", "additive"];
const PHASE_TYPES: PhaseType[] = ["mash", "boil", "ferment"];
const OPTIONAL_PHASE_TYPES: PhaseType[] = ["carbonation", "conditioning"];
```

⚠️ **`PHASE_TYPES` is the *required* three, not every `PhaseType`.** It is what `defaultBrewable`
seeds one phase of each from, and what `canRemovePhase` checks against to refuse dropping the last
phase of a required type. Reading it as "all phase types" inverts both.

### `Milestone`

```ts
interface Milestone {
    id: string;
    label: string;
    kind: MilestoneKind;
}
```

A reading the brewer **plans** to take during a phase — plan config, not the measurement. Because it
is plan data it rides on the brewable, so a recipe can prescribe its own readings.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | yes | Stable per-milestone id, minted where the milestone is created. It is what the tracker entry keys off. |
| `label` | `string` | yes | What the brewer calls this reading. Seeded per kind at creation (`"Reading"`, `"Volume"`, `"Temperature"`…) so several kinds on one phase get distinct accessible names; freely renamed afterwards. |
| `kind` | `MilestoneKind` | yes | What sort of reading it is. Decides which grid on the phase renders it, and what shape its tracker entry takes. |

⚠️ **The value and date are not here.** They live in `batch.tracker`, keyed by `{on: "milestone", id}`
— see [_The tracker_](#the-tracker). A `Recipe`'s milestones therefore carry no values at all, which
is the point: the recipe prescribes the reading, the batch records it.

### `BrewablePhase`

```ts
interface BrewablePhase {
    id: string;
    type: PhaseType;
    equipment: Equipment[];
    milestones: Milestone[];
}
```

One phase in the schedule — the plan's **unit of identity**. Two `"boil"` phases are two distinct
phases with their own ingredients, equipment and readings.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | **yes** | Stable per-instance id, minted at every creation site — `defaultBrewable`, `kbBrewableToBrewable`, and the Phases add-row. |
| `type` | `PhaseType` | yes | Which brew-day stage this phase is. Not an identity: several phases may share a `type`. |
| `equipment` | `Equipment[]` | yes | The kit this phase calls for — [`Equipment`](#equipment). |
| `milestones` | `Milestone[]` | yes | The readings planned for this phase. Their values live in the batch's tracker. |

⚠️ **`id` is required here, unlike `Equipment.id?` and `AssignmentBase.id?`.** Those two are optional
on the type and backfilled by `ensureBrewableIds` in the batch write path, so a *recipe*'s equipment
and assignments have none. A phase's id is not optional at any point, because assignments and tracker
refs address a phase **instance** rather than its type — an id-less phase would leave them with
nothing to point at. Which creation sites mint what, and why the split falls where it does, is in
[`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models).

### `Schedule`

```ts
interface Schedule {
    phases: BrewablePhase[];
}
```

A single-field wrapper around the ordered phase list. **Order is meaningful** — it is the brewing
order the brewer arranged, and `phaseLabel`'s numbering (`"1. Mash"`, `"2. Boil"`) follows position,
so it renumbers on reorder.

### `Assignment` and `AssignmentBase`

```ts
interface AssignmentBase {
    id?: string;
    phaseId: string;
    slug: string;
}

type Assignment = AssignmentBase & (
    | { resourceType: "grain"; resource: Grain }
    | { resourceType: "hop"; resource: Hop }
    | { resourceType: "yeast"; resource: Yeast }
    | { resourceType: "additive"; resource: Additive }
);
```

One resource placed into one phase. A **discriminated union**: switching on `resourceType` narrows
`resource` to the matching element model. `AssignmentBase` is not exported — it exists only as the
shared half of that intersection.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | no | Stable per-instance id. Optional on the type, but minted unconditionally by `ensureBrewableIds` in the batch write path, so **any stored batch has one** — a recipe or kb brewable does not. See [`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models). |
| `phaseId` | `string` | yes | The `BrewablePhase.id` this resource belongs to. ⚠️ **Never a phase *type*** — that is a kb-side-only field, resolved to an id by `kbBrewableToBrewable`. |
| `slug` | `string` | yes | Catalog identity — which grain/hop/yeast this *is*, shared across every instance of it. Distinct from `id`, which is this one placement. |
| `resourceType` | `ResourceType` | yes | The discriminant. |
| `resource` | `Grain` \| `Hop` \| `Yeast` \| `Additive` | yes | The resource itself, narrowed by `resourceType`. All four are documented under [_The resource models_](#the-resource-models). |

- ⚠️ **`id` and `slug` answer different questions.** Two additions of the same hop at different boil
  times share a `slug` and have distinct `id`s; the tracker keys off `id`, so each is checked off
  independently.
- Addressing a phase by id rather than by type is what lets two `"boil"` phases hold different
  ingredients. The kb format authors `phaseType` instead — hand-written data should not contain
  uuids — and `transform/kbBrewableToBrewable.ts` resolves it to the id of the **first** phase of
  that type on import. The `Kb*` side of that is documented in `packages/kb`.

### `Brewable`

```ts
interface Brewable {
    schedule: Schedule;
    assignments: Assignment[];
}
```

Two fields, and between them the whole plan.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `schedule` | `Schedule` | yes | The ordered phases, with their equipment and planned readings. |
| `assignments` | `Assignment[]` | yes | Every ingredient placement, **flat** — not nested under its phase. Each names its phase through `phaseId`. |

⚠️ **Assignments are a flat list, not a per-phase one.** Grouping by phase is done at render time
(BrewableEdit's Ingredients panel, BatchSchedule's tabs); the model keeps one array so an ingredient
can move between phases by rewriting a single field.

Three models carry a brewable, and they do not all get one the same way — see
[_Narrowing from the kb catalog_](#narrowing-from-the-kb-catalog) above:

- [`Recipe.brewable`](#recipe) and [`Batch.brewable`](#batch) are typed `Brewable` directly.
- `KbRecipe.brewable` is a `KbBrewable`, narrowed by
  [`transform/kbBrewableToBrewable.ts`](src/transform/kbBrewableToBrewable.ts) at the moment a kb
  recipe is instantiated.

A batch's brewable is its **own copy** — a deep clone for a user recipe, the transform's output for a
kb one — so editing the plan in Planning never touches the recipe it came from.

## The resource models

The four shapes an [`Assignment.resource`](#assignment-and-assignmentbase) narrows to, one per
`ResourceType` — [`Grain`](#grain), [`Hop`](#hop), [`Yeast`](#yeast), [`Additive`](#additive), each in
its own file under [`src/model/`](src/model/). They are the smallest models in the app: a name plus
the values a brewer sets for **this placement**.

⚠️ **None of them is an `Entity`, and none of them narrows from a `Kb*` type.** They carry no `id`
and no `version` because they are not persisted records — a resource exists only inside the
`Assignment` that holds it, and the assignment's own `id`/`slug` are what address and identify it.
Nor do they `extend` their catalog counterparts the way [`Recipe`](#recipe) and
[`UserEquipment`](#userequipment) do: a `KbHop` is reference material (`origin`, `usage`, `notes`,
`alpha` as a bare number) and a `Hop` is a quantity in a phase, so the two overlap on `name` and
almost nothing else. Picking one from a catalog dropdown runs a **factory**, not a narrowing —
`kbGrainToRecipeGrain`/`kbHopToRecipeHop`/`kbYeastToRecipeYeast` in
[`screen/brewable-edit/ingredients/catalog-defaults.ts`](src/screen/brewable-edit/ingredients/catalog-defaults.ts),
which take the catalog's `name` (and, for a hop, its `alpha`) and seed every other field with a
placeholder default.

⚠️ **The brew-day *actuals* reuse these field names rather than a parallel shape.**
`TrackerEntry.resource` is `ResourceActuals` — `Partial<Omit<Grain & Hop & Yeast & Additive, "name">>`
— so a recorded weight lands under `weight`, a recorded boil under `boil`, keyed identically to the
plan. Adding a field to any of the four therefore widens what a schedule row can record, without a
tracker change. The write paths are in
[`packages/app/CLAUDE.md`, _BatchSchedule screen_](CLAUDE.md#batchschedule-screen-configurable-phases).

Every `Scalar` below is [core's](../core/MODELS.md#scalar): `value` is the full display string with
the unit embedded (`"9.0lb"`, `"60min"`, `"5.5%"`), and `unit` is a parsing hint.

### `Grain`

```ts
interface Grain {
    name: string;
    weight: Scalar;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What this grain is called — the catalog name when picked from the dropdown, free text otherwise. Display only; catalog identity is the assignment's `slug`. |
| `weight` | `Scalar` | yes | How much of it goes in. Seeded `{value: "0.0lb", unit: "lb"}` on a catalog pick. |

A grain has **no secondary value** — no boil time, no temperature — which is why its schedule row is
a checkbox and an amount and nothing else: grain goes into the mash all at once.

### `Hop`

```ts
interface Hop {
    name: string;
    weight: Scalar;
    alpha: Scalar;
    boil: Scalar;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What this hop is called. As `Grain.name` — display only. |
| `weight` | `Scalar` | yes | How much goes in at this addition. Seeded `{value: "0.0oz", unit: "oz"}`. |
| `alpha` | `Scalar` | yes | Alpha-acid percentage, as a scalar — `{value: "5.5%", unit: "%"}`. Carried from the catalog hop's own value at pick time; editable afterwards, because a specific lot's alpha differs from the catalog's. |
| `boil` | `Scalar` | yes | How long it boils — `{value: "60min", unit: "min"}` by default. It is a **countdown**, not a clock time: 60min goes in before 15min. |

- ⚠️ **`alpha` is a `Scalar` here and a bare `number` on the catalog's `KbHop`.** The catalog states a
  varietal fact and the app states a value a brewer can type and re-unit, so the conversion happens
  at pick time (`` `${kbHop.alpha}%` ``) and nothing converts back. A reader that needs a number
  parses `value`. The catalog side is documented in [`packages/kb`](../kb/CLAUDE.md).
- **`boil` is what makes two additions of one hop distinguishable.** They share a `slug` and differ
  only here, so the brew-day quick action labels its options `` `${name} · ${boil.value}` `` and
  brewing order sorts longest-boil first — see
  [`packages/app/CLAUDE.md`, _BatchSchedule screen_](CLAUDE.md#batchschedule-screen-configurable-phases).

### `Yeast`

```ts
interface Yeast {
    name: string;
    avg_attn: Scalar;
    temp: Scalar;
    starter: boolean;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What this yeast is called. As above — display only. |
| `avg_attn` | `Scalar` | yes | Average apparent attenuation — `{value: "70%", unit: "%"}` by default. |
| `temp` | `Scalar` | yes | The fermentation temperature to hold, a **single** value — `{value: "0°F", unit: "°F"}` by default, i.e. unset until the brewer types one. |
| `starter` | `boolean` | yes | Whether a starter is being made. The only non-`Scalar`, non-`string` field on any resource model, and the reason `ResourceScalarField` excludes it. |

⚠️ **The catalog carries neither of the two numbers.** `KbYeast` has `temp: [string, string]` — a
recommended **range** — and no attenuation at all, so `kbYeastToRecipeYeast` takes the name and seeds
`avg_attn`/`temp`/`starter` with placeholders; the catalog's range is dropped rather than collapsed to
one end of it. A yeast picked from the dropdown therefore shows `0°F` until the brewer sets it, and
the range is only ever visible on the knowledge screens.

### `Additive`

```ts
interface Additive {
    name: string;
    boil?: Scalar,
    weight?: Scalar,
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What the additive is. **Typed, never picked** — there is no additive catalog, so the Ingredients add-row is a freeform text field for this type alone. |
| `boil` | `Scalar` | no | How long it boils, when that is the relevant fact (a kettle fining, a nutrient). |
| `weight` | `Scalar` | no | How much goes in. |

⚠️ **Both value fields are optional, and that is load-bearing rather than lax.** An additive is either
a timed addition or a dosed one, and older stored additives carry `boil` alone, so a required
`weight` would invalidate them. The row branches on which one the resource actually carries;
`defaultAdditive(name, phaseType)` seeds `weight` always and adds `boil` on every phase except
Conditioning. That branching is UI behaviour — see
[`packages/app/CLAUDE.md`, _Model boundary_](CLAUDE.md#model-boundary-kb-vs-app-models); the shape
fact is only that neither field is guaranteed and a reader must handle both being absent.

## `Equipment`

A single piece of kit **on a phase** — `brewable.schedule.phases[].equipment[]`.

```ts
interface Equipment {
    id?: string;
    name: string;
    notes?: string;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | no | Stable per-instance id, **conditional** — see below. |
| `name` | `string` | yes | What the item is called (`"Boil Kettle - 15gal"`). Also the accessible name of its checkbox on the brew-day screen. |
| `notes` | `string` | no | Free text about this item. Nothing imposes a meaning on it, and the seed catalog does not use it consistently — one row carries `"4"`, a count. |

⚠️ **`id` is present on batch-phase equipment and absent on catalog templates.** It is minted by
[`actions/ensureBrewableIds.ts`](src/actions/ensureBrewableIds.ts) in the batch **write path** only, so
any equipment item inside a stored batch has one, while the templates in
[`data/equipment.ts`](src/data/equipment.ts) — and a recipe's equipment, which never runs that path —
stay id-less. The id is what a `{on: "equipment", id}` tracker ref addresses, which is why an item
without one cannot be checked off. Same optional-then-backfilled treatment as
[`AssignmentBase.id`](#assignment-and-assignmentbase), and the opposite of
[`BrewablePhase.id`](#brewablephase), which is required everywhere.

⚠️ **This is not [`UserEquipment`](#userequipment), despite the overlapping fields.** `UserEquipment`
is a persisted `Entity` in the brewer's own equipment list — a thing they own. An `Equipment` is a
line on a plan: what this phase calls for. Nothing links the two, and copying an item from the list
into a phase copies the values, not a reference.

## `Measurements`

The five vitals of a beer — carried twice, as [`Recipe.targets`](#recipe) (what the brewer is aiming
at) and [`Batch.actuals`](#batch) (what a brew came out at).

```ts
interface Measurements {
    og: Scalar;
    fg: Scalar;
    abv: Scalar;
    ibu: string;
    srm: string;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `og` | `Scalar` | yes | Original gravity — `{value: "0.00°P", unit: "°P"}` in the seeded defaults. |
| `fg` | `Scalar` | yes | Final gravity, same convention. |
| `abv` | `Scalar` | yes | Alcohol by volume — `{value: "0.0%", unit: "%"}`. |
| `ibu` | `string` | yes | Bitterness, as a **bare string** — `"0"` in the defaults. Rendered verbatim. |
| `srm` | `string` | yes | Colour, as a **bare string** — `"0"` in the defaults. Parsed with `Number(srm)` where a swatch is drawn, and rendered verbatim otherwise. |

⚠️ **Two representations for one family of measurements, with nothing in the type saying why.**
`og`/`fg`/`abv` are `Scalar`s carrying their own unit; `ibu`/`srm` are bare strings carrying a number
and no unit, so every consumer that needs one reads `.value` for three fields and the field itself for
the other two ([`component/vitals/`](src/component/vitals/index.tsx) declares a structural
`VitalsLike` to cope). Both are genuinely unitless scales, which is a defensible reason and is not
stated anywhere in the code. **Recorded here as fact, not as a defect to fix** — changing it is a
stored-shape change and would need a migration.

⚠️ **`Batch.actuals` is stored but never written by any screen.** The Summary tab shows a value
computed live from the batch's `"gravity"` milestone readings (`hooks/useActuals.ts` — earliest by
date is OG, latest is FG) and its IBU from `useEstimatedIbu`, leaving the stored `actuals` at
`defaultBatch`'s placeholders. Read a batch's as-brewed vitals through the live hook, not off the
field. `Recipe.targets`, by contrast, is edited directly on the recipe Details panel and is real.

## The tracker

Everything a brewer records **while brewing** — checkoffs, as-brewed amounts, gravity and water
readings, the yeast's pitch date. It is one field, [`Batch.tracker`](#batch):

```ts
tracker: Record<string, TrackerEntry>;
```

The types below live in [`src/model/tracker.ts`](src/model/tracker.ts).

⚠️ **The tracker is an *overlay*, not a second plan.** The [`Brewable`](#the-brewable-family) states
what was intended and the tracker states what happened, keyed to the plan's own ids and using the
plan's own field names. Nothing on the brew-day screen edits the plan — a recorded value never
overwrites the intent it drifted from. Only a [`Batch`](#batch) has one; a [`Recipe`](#recipe) has
nothing to record.

A key is a `Ref` run through the module's `key()` helper. Its exact format is behaviour, not shape —
see [`packages/app/CLAUDE.md`, _Live computation_](CLAUDE.md#live-computation-srchooks-pure-functions-in-srcmodel)
— and the sanctioned writers (`putEntry`/`pruneTracker`) are in
[_Actions_](CLAUDE.md#actions-srcactions--anything-whose-result-is-persisted).

### `Ref`

```ts
type Ref =
    | { on: "assignment"; id: string }
    | { on: "equipment"; id: string }
    | { on: "milestone"; id: string }
    | { on: "phase"; id: string };
```

What an entry is attached to. Four variants, one shape: a kind plus the **stable per-instance uuid**
of the thing being recorded against.

| Variant | `id` is | Records |
|---|---|---|
| `assignment` | [`AssignmentBase.id`](#assignment-and-assignmentbase) | One ingredient placement — its checkoff, its as-brewed values, a yeast's pitch date. |
| `equipment` | [`Equipment.id`](#equipment) | One piece of a phase's kit — checked off or not. |
| `milestone` | [`Milestone.id`](#milestone) | One planned reading — its value and when it was taken. |
| `phase` | [`BrewablePhase.id`](#brewablephase) | The phase itself — that it was completed, and when. |

⚠️ **No variant carries its parent, and that is deliberate.** Each uuid is unique on its own, so a
`phaseId` beside it would add nothing but a second thing to keep true: encoding a *relationship*
inside an *identity* orphans the entry the moment the item moves between phases. The milestone ref
did carry a `phaseId` once, back when a milestone had no id and was addressed by phase plus a fixed
kind; giving milestones uuids retired it.

⚠️ **An entry is only reachable while its `id` exists.** [`Equipment.id`](#equipment) and
[`AssignmentBase.id`](#assignment-and-assignmentbase) are optional on the type and minted only in the
batch write path, so an item that has never been saved has nothing to key against. A ref dropped from
the brewable has its entry pruned on the next save, and re-adding the item mints a fresh id with no
prior entry — deleting an ingredient in Planning discards what was recorded about it.

### `TrackerEntry`

```ts
type TrackerEntry = {
    completed?: boolean;
    date?: string;
    resource?: ResourceActuals;
    reading?: Scalar;
    water?: WaterReadings;
};
```

One record of what happened. **Every field is optional** — an entry holds only what has actually been
recorded, and an absent entry and an empty one mean the same thing.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `completed` | `boolean` | no | Ticked off. Written for `assignment` (the ingredient went in), `equipment` (the kit is ready) and `phase` (the phase is finished). |
| `date` | `string` | no | When this happened or was measured. **Universal** — any ref kind may carry one. |
| `resource` | [`ResourceActuals`](#resourceactuals-and-resourcescalarfield) | no | `assignment` only — the as-brewed values, in the plan's own field names. |
| `reading` | `Scalar` | no | `milestone` only — the single value read. A milestone has no resource to mirror, which is why it gets its own field. |
| `water` | [`WaterReadings`](#waterparameter-and-waterreadings) | no | `milestone` only, and only the `"water"` kind — a whole sample rather than one value. |

Which fields a given entry uses follows from its ref, and for a milestone from its
[`MilestoneKind`](#phasetype-resourcetype-milestonekind):

| Ref | Fields it uses |
|---|---|
| `assignment` | `completed`, `resource`, and `date` for a yeast's pitch date |
| `equipment` | `completed` |
| `phase` | `completed` + `date` |
| `milestone`, value kinds (`gravity`, `volume`, `temperature`, `pressure`) | `reading` + `date` |
| `milestone`, date kinds (`kegDate`, `bottleDate`) | `date` alone — never a `reading` |
| `milestone`, `water` | `water` + `date` |

- ⚠️ **`date` is two different strings depending on who wrote it, and the type cannot tell you which.**
  A phase completion and a quick-logged milestone write a full absolute ISO timestamp, because the
  brew timer places them on its line as an offset from the session start. Every other writer is an
  `<input type="date">` and writes a date-only `YYYY-MM-DD`. A reader that needs a time-of-day must
  cope with both. The consequences — an edited timestamp losing its time and dropping off the
  timeline — are in
  [`packages/app/CLAUDE.md`, _BatchSchedule screen_](CLAUDE.md#batchschedule-screen-configurable-phases).
- ⚠️ **A `reading` can be present but empty.** Clearing the field, or switching the unit before typing
  anything, stores `{value: "", unit}`. A consumer must test that the value parses, not merely that
  the field is set — a presence-only check renders `NaN`.
- `resource` and `water` are the two **bundled** fields, and both are merged a level deeper than the
  rest of the entry when written, so recording one mineral or one column cannot wipe a sibling
  recorded a moment earlier. That merge is `putEntry`'s, documented in
  [_BatchSchedule screen_](CLAUDE.md#batchschedule-screen-configurable-phases).

### `ResourceActuals` and `ResourceScalarField`

```ts
type ResourceActuals = Partial<Omit<Grain & Hop & Yeast & Additive, "name">>;

type ResourceScalarField = Exclude<keyof ResourceActuals, "starter">;
```

`ResourceActuals` is the as-brewed counterpart of an [`Assignment`](#assignment-and-assignmentbase)'s
`resource`, and it is **derived from the four resource models rather than listed**: the intersection
of [`Grain`](#grain), [`Hop`](#hop), [`Yeast`](#yeast) and [`Additive`](#additive), made wholly
optional, with `name` removed. So a hop records `weight`/`boil`/`alpha`, a grain `weight`, a yeast
`temp` — under the **same field names the plan uses**, which is what lets a schedule column read plan
and actual from one key.

⚠️ **Deriving it is the point, not a shorthand.** Adding a field to `Hop` makes it recordable here for
free, and a row can record any number of differing values rather than the fixed pair an
`actual`/`actualDetail` shape allowed. `name` is excluded because it *identifies* the resource — it is
not something a brewer observes. What it cannot express is a per-resource restriction: nothing in the
type stops a grain entry carrying a yeast's `temp`, so the narrowing is the schedule screen's
`COLUMNS` table, not the type's.

`ResourceScalarField` is that key set minus `starter` — every field holding a `Scalar`. `starter` is
the one `boolean` on any resource model (see [`Yeast`](#yeast)), and excluding it is what lets a
schedule column or a quick check-off assume the field it is editing takes a scalar.

### `WaterParameter` and `WaterReadings`

```ts
type WaterParameter = "ph" | "calcium" | "magnesium" | "sodium" | "sulfate" | "chloride" | "bicarbonate";

type WaterReadings = Partial<Record<WaterParameter, Scalar>>;
```

A water sample: seven measurements, each an optional [`Scalar`](../core/MODELS.md#scalar) — pH plus the
six mineral concentrations a brewer adjusts mash chemistry with.

⚠️ **One `"water"` milestone is one whole sample, not seven milestones.** That is why the `"water"`
kind writes `TrackerEntry.water` instead of the `reading` every other kind uses: the seven values are
taken together and belong in one row. Each parameter has a **fixed unit** (there is no unit dropdown),
so a partial sample is normal — `WaterReadings` is `Partial`, and an unmeasured parameter is simply
absent.

## `ShoppingItem`

The batch's shopping list — [`Batch.shopping`](#batch), defined in
[`src/model/batch.ts`](src/model/batch.ts).

```ts
type ShoppingTag = "hops" | "grains" | "yeasts" | "additives" | "misc";

interface ShoppingItem {
    name: string;
    tags: ShoppingTag[];
    scalar?: Scalar;
    cost: Scalar;
    purchased: boolean;
    source: "derived" | "user";
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `name` | `string` | yes | What to buy. For a derived item, the ingredient's own name; for a user item, whatever the brewer typed. |
| `tags` | `ShoppingTag[]` | yes | Which group the row falls under. An array on the type, but the rebuild writes exactly one, and `tags[0]` is half the item's identity key. `"misc"` is the hand-added catch-all: a brewer never picks a group, so an item added by hand takes `"misc"` unless its name matches a row already on the list, in which case it joins that row's group. |
| `scalar` | `Scalar` | no | How much to buy — the summed weight of every assignment of that ingredient, keeping the unit it was entered in. **Absent for yeasts and additives**, which are counted rather than weighed. |
| `cost` | `Scalar` | yes | What it cost, a currency scalar (`{value: "$0.00", currency}`). Brewer-owned; seeded at zero. |
| `purchased` | `boolean` | yes | Ticked off in the shop. Brewer-owned; seeded `false`. |
| `source` | `"derived" \| "user"` | yes | Where the row came from — the ingredients, or the brewer's own hand. |

⚠️ **This is the app's one *persisted* derivation, which is why `source` exists at all.** `"derived"`
rows are rebuilt from the brewable's ingredients on every save that changes them; `"user"` rows are
added by hand and are never rebuilt or removed. A rebuild matches the new list against the old by a
stable `` `${tags[0]}:${name}` `` key and carries the brewer-owned `cost`/`purchased` across, so
editing a recipe's grain bill does not clear the prices beside it — an ingredient **renamed**,
though, is a different key and starts fresh. The rebuild, its trigger diffing and its
reuse-by-reference are in
[`packages/app/CLAUDE.md`, _Actions_](CLAUDE.md#actions-srcactions--anything-whose-result-is-persisted).

## `BatchNotes`

```ts
interface BatchNotes {
    notes: string;
    srm?: string;
}
```

Free-text notes on a batch — [`Batch.notes`](#batch), optional, so a batch nobody has written about
carries the field not at all.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `notes` | `string` | yes | Whatever the brewer wants to say about this brew. Nothing imposes a structure on it. |
| `srm` | `string` | no | The colour the brewer **observed**, as a bare number string — the same unitless convention [`Measurements.srm`](#measurements) uses. Distinct from the recipe's target and from `actuals.srm`: this is what the beer looked like. |
