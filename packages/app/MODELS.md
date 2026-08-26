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
| `Brewable` | `KbBrewable` | **not** a TS `extends` — narrowed entirely by [`transform/kbBrewableToBrewable.ts`](src/transform/kbBrewableToBrewable.ts) (documented fully in task #1328) |

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
| `targets` | `Measurements` | yes | The recipe's intended OG/FG/ABV/IBU/SRM — what the brewer is aiming at. Structurally the same shape `KbRecipe.targets` declares inline; here it is the app's named `Measurements` type, documented in task #1329. |
| `brewable` | `Brewable` | yes | The plan: phases, their equipment, and the ingredient assignments. Narrowed from `KbBrewable`; documented in task #1328. |

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
| `brewable` | `Brewable` | yes | This batch's **own copy** of the plan — a deep clone of the recipe's brewable for a user recipe, `kbBrewableToBrewable(kbRecipe.brewable)` for a kb one. Editing it in Planning never touches the recipe it came from. Documented in task #1328. |
| `brewer` | `string` | no | Who brewed it. Carried from the recipe when there is one; absent otherwise. |
| `batchSize` | `Scalar` | yes | Target volume — `{value: "5gal", unit: "gal"}` by default. |
| `efficiency` | `Scalar` | yes | Assumed mash efficiency — `{value: "75%", unit: "%"}` by default. |
| `boilTime` | `Scalar` | yes | Planned boil length — `{value: "60min", unit: "min"}` by default. |
| `actuals` | `Measurements` | yes | The as-brewed OG/FG/ABV/IBU/SRM. ⚠️ **No screen writes it** — the Summary tab shows a live value computed from `tracker` gravity readings instead, so what is stored here is the seeded placeholder (`"0.00°P"` etc.) unless something else set it. Documented in task #1329. |
| `shopping` | `ShoppingItem[]` | yes | The shopping list. Documented below, task #1330. |
| `tracker` | `Record<string, TrackerEntry>` | yes | The brew-day overlay — checkoffs, actuals, readings, keyed by a stringified ref. Documented below, task #1330. |
| `timer` | `TimerEvent[]` | no | The brew-day timer's session log — see below. |
| `notes` | `BatchNotes` | no | Free-text notes plus an observed SRM. Documented below, task #1330. |

**`brewDate` and `packaging` are brew-day facts, and that is why a `Recipe` does not carry them.** A
recipe is a plan that can be brewed any number of times; the day it was brewed and how it was
packaged are true of one brew only. The same split explains why `batchSize`/`efficiency`/`boilTime`
appear on *both*: the recipe states the intent, the batch holds this brew's own value, and editing
one does not move the other.

### `Batch.timer`

```ts
type TimerEventType = "start" | "pause" | "resume" | "stop";

interface TimerEvent {
    type: TimerEventType;
    date: string;
}
```

An **append-only session log** for the global brew timer — one array per batch, not a map keyed by
ids and not scoped to a phase (which is what makes it shaped unlike `tracker`).

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
— documented below, task #1330. A `Recipe`'s milestones therefore carry no values at all, which is
the point: the recipe prescribes the reading, the batch records it.

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
| `equipment` | `Equipment[]` | yes | The kit this phase calls for. `Equipment` is documented in task #1329. |
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
| `resource` | `Grain` \| `Hop` \| `Yeast` \| `Additive` | yes | The resource itself, narrowed by `resourceType`. All four are documented in task #1329. |

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
