# MODELS.md

Field-by-field reference for [`src/models.ts`](src/models.ts) — the seven `Kb*` catalog types — and
[`src/brewable.ts`](src/brewable.ts) — the primitives-only `Brewable` supertypes a recipe carries its
plan in.

This file is also the **specification the data repo does not have.** The JSON these types describe is
authored in [`brewdocs.beer-kb`](https://github.com/matt-whitaker/brewdocs.beer-kb), which owns the
build, the validator and the ids; what it does not own is a statement of what each field *means*. That
is here.

⚠️ **This file states shape, and where shape and data disagree it says what the data actually does.**
Mechanism and *why* stay in a `CLAUDE.md` — the `__type` discriminator rule and the data-side
conventions are [`CLAUDE.md`](CLAUDE.md)'s, the kb→app narrowing is
[`packages/app/CLAUDE.md`, _Model boundary_](../app/CLAUDE.md#model-boundary-kb-vs-app-models)'s. This
file links to them rather than restating them.

⚠️ **Every measured value here is a `Scalar`** — `{value: "9.0lb", unit: "lb"}`, where `value` is the
full display string and `unit` is a hint. The convention, the unit vocabulary and the guards are in
[`packages/core/MODELS.md`, _Scalar_](../core/MODELS.md#scalar); they are not repeated here. The two
fields that are **not** `Scalar` are called out where they appear.

## Every `Kb*` extends `Entity`

All seven catalog types extend [`Entity`](../core/MODELS.md#entity) — `id: string` plus an optional
`version: number`. The `id` is **derived from the data file's name** by kb's builder, not authored;
that derivation, and what renaming a data file therefore breaks, is [`CLAUDE.md`](CLAUDE.md)'s. The
brewable-family types (`KbBrewable`, `KbSchedule`, `KbBrewablePhase`, `KbAssignment`) are **not**
entities — they are nested structure inside a recipe, with no id of their own.

Each also carries a `__type` discriminator, stamped by the builder from the data directory's name.

## The corpus

Measured against a `brewdocs.beer-kb` checkout at commit `799d783` — all 104 `data/**` files, with its
own `bin/validate.js` reporting *"Validated 104 files"*. **The tiers below are ordered by this table**,
not by declaration order in the source: a type whose declared shape and whose actual data disagree gets
documented first and at length, and a type with a wide, uniform corpus gets one line per field.

| resource | files | field population |
|---|---|---|
| `grains` | 33 | `name`/`lovibond`/`origin`/`notes` all 33/33 |
| `yeasts` | 25 | `name` 25/25; `temp`/`description`/`origin` **24/25** |
| `hops` | 19 | `name`/`alpha`/`origin`/`notes`/`usage` all 19/19 |
| `equipment` | 18 | `name`/`notes` 18/18; `count` **1/18** |
| `additives` | 8 | `name`/`type`/`dosage`/`stage`/`notes` all 8/8 |
| `recipe-templates` | 2 | all fields present; **both carry zero assignments** |
| `recipes` | 1 | all fields present |

⚠️ **These counts are a snapshot of a repo this one does not build.** kb data ships without an app
rebuild (see the root `CLAUDE.md`, _Deployment_), so the corpus moves independently of this file and
nothing fails when they drift. Re-measure before treating a count as current; the *disagreements* the
counts support are the durable part.

---

# Tier 1 — where the type and the data disagree

Read these first. In each case the interface promises something the corpus does not deliver, and this
section states what is actually true. **None of it is fixed here** — see
_[Findings recorded, not fixed](#findings-recorded-not-fixed)_.

## `KbYeast`

```ts
interface KbYeast extends Entity {
    __type: "kbYeast";
    name: string;
    temp: [string, string];
    description: string;
    origin: string;
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbYeast"` | required | Discriminator. Single literal — narrows cleanly in both branches. |
| `name` | `string` | required | The strain as a brewer names it — `"Wyeast 2112"`. **This is also the join key an assignment uses**, see `KbAssignment.slug`. |
| `temp` | `[string, string]` | required | Fermentation temperature **range**, as a `[low, high]` tuple of display strings. Not a `Scalar` and not a pair of them — a bare two-string tuple, so nothing carries a `unit` and nothing validates the ordering. |
| `description` | `string` | required | Free prose — character, flocculation, what it suits. |
| `origin` | `string` | required | Lab or region of origin. |

⚠️ **`temp`, `description` and `origin` are declared required and one file has none of them.**
`data/yeasts/wyeast-2112.json` is the literal object `{"name": "Wyeast 2112"}`. One file in 25 — and it
is the yeast the single shipped recipe pitches, so it is on the most-travelled path, not in a corner.
The type says required; the data says a `KbYeast` can arrive holding a name and nothing else. A consumer
that reads `yeast.temp[0]` without a guard throws on that record.

⚠️ **A yeast has two unrelated shapes in this package, and they do not reference each other.** The
catalog `KbYeast` above carries a temperature **range** and no attenuation. The yeast an *assignment*
carries — `KbAssignment.resource`'s third member — is `{name, avg_attn: Scalar, temp: Scalar, starter:
boolean}`: a single temperature, an attenuation figure the catalog does not have, and a starter flag.
Neither type mentions the other, no field is shared but `name`, and `slug` is the only thing that joins
them. Documented on both sides deliberately; see [`KbAssignment`](#kbassignment).

## `KbEquipment`

```ts
interface KbEquipment extends Entity {
    __type: "kbEquipment" | "equipment";
    name: string;
    notes: string;
    count?: number;
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbEquipment" \| "equipment"` | required | Discriminator, **a two-member union** — it admits the app's own tag. See _[the discriminator unions](#the-two-discriminator-unions)_ below. |
| `name` | `string` | required | The item as a brewer names it — the join key for `KbBrewablePhase.equipment[].name`. |
| `notes` | `string` | required | Free prose — what it is for, capacity, caveats. |
| `count` | `number` | **optional** | How many of the item the reference kit holds. A bare `number`, not a `Scalar` — it counts things, it does not measure them. |

⚠️ **`count` is set on 1 file of 18** (`keg-coke-5-5gal.json`, value `4`). It is effectively unused: do
not read its absence as "one of these", and do not build a display that assumes every item carries one.
What the single populated value means — how many the kit has, not how many a recipe needs — is inferred
from that one file, so treat the field's intent as thin rather than settled.

⚠️ **Equipment appears twice in this package with no link between the two.** A `KbEquipment` is a
catalog entry; the equipment *inside* a recipe's plan is `KbBrewablePhase.equipment`, an inline
`{name, notes?}` — no id, no `count`, no reference to the catalog. Same name-match join as everything
else here.

## `KbBrewable`, `KbSchedule`, `KbBrewablePhase`

The plan a recipe carries: an ordered list of phases, plus the assignments that hang off them. These are
**primitives-only supertypes** of the app's `Brewable`/`BrewablePhase`/`Assignment` — loose `string`
where the app has a union, so a narrower app value stays assignable to the kb type. What the app does
with them at the boundary is [`packages/app/CLAUDE.md`, _Model
boundary_](../app/CLAUDE.md#model-boundary-kb-vs-app-models)'s.

```ts
interface KbBrewable {
    schedule: KbSchedule;
    assignments: KbAssignment[];
}

interface KbSchedule {
    phases: KbBrewablePhase[];
}

interface KbBrewablePhase {
    type: string;
    equipment: { name: string; notes?: string; }[];
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `KbBrewable.schedule` | `KbSchedule` | required | The phase skeleton — what happens, in order. |
| `KbBrewable.assignments` | `KbAssignment[]` | required | Every ingredient the plan calls for, each pointing at a phase. A **flat** list, not nested under phases. May be empty — both shipped recipe templates have exactly that. |
| `KbSchedule.phases` | `KbBrewablePhase[]` | required | Ordered. Position is meaningful; nothing else establishes sequence. |
| `KbBrewablePhase.type` | `string` | required | What kind of phase — `"mash"`, `"boil"`, `"ferment"`. **A loose string with no vocabulary declared in this package**; the app narrows it to its own `PhaseType`. |
| `KbBrewablePhase.equipment[].name` | `string` | required | The item, matched to a `KbEquipment` by name. |
| `KbBrewablePhase.equipment[].notes` | `string` | optional | Phase-specific note about that item's use. |

⚠️ **A kb phase has no id, and that is deliberate** — hand-authored data should not contain uuids. The
consequence is that authored data can only say *which kind* of phase an assignment belongs to, never
*which one*; two `"boil"` phases are indistinguishable from the data side. Minting instance ids and
resolving the ambiguity is the app's job, at its transform boundary, and it resolves to the **first**
phase of the named type.

## `KbAssignment`

One ingredient, placed in the plan.

```ts
interface KbAssignment {
    phaseType?: string;
    phaseId?: string;
    slug: string;
    resourceType: string;
    resource:
        | { name: string; weight: Scalar }
        | { name: string; weight: Scalar; alpha: Scalar; boil: Scalar; phase?: string }
        | { name: string; avg_attn: Scalar; temp: Scalar; starter: boolean }
        | { name: string; boil?: Scalar; weight?: Scalar };
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `phaseType` | `string` | optional | Which **kind** of phase this belongs to — what authored kb JSON carries. |
| `phaseId` | `string` | optional | Which phase **instance** — set on app-side brewables only, never in authored data. |
| `slug` | `string` | required | Identifies the resource. ⚠️ **It holds the display name, not the id** — see below. |
| `resourceType` | `string` | required | Which family the resource belongs to — grain, hop, yeast, additive. A loose string; the app narrows it to `ResourceType`, and it is what selects which member of the `resource` union applies. |
| `resource` | union of four | required | The ingredient's own fields. **Not a discriminated union** — it carries no tag of its own, and `resourceType` is the only thing that says which member you have. Plain rather than discriminated so the app's narrower `Assignment` stays assignable to this type. |

⚠️ **`slug` does not hold a slug.** Its own JSDoc in `brewable.ts` says it *"identifies the resource
within its catalog/collection"*, and in the corpus it does not: it holds the **display name** —
`"German Pils"`, `"Wyeast 2112"`, `"Northern Brewer"` — while the catalog id, derived from the filename,
is `"german-pils"`, `"wyeast-2112"`, `"northern_brewer"`. **Joining an assignment to its catalog entry
is a name match, not an id match**, and a consumer that treats `slug` as a key into a resource map by id
finds nothing. This corrects the JSDoc rather than agreeing with it.

⚠️ **A slug can resolve to no catalog entry at all.** `"Yeast Nutrients"` in the one shipped recipe has
no file under any resource directory. The join is unenforced in both directions: nothing validates that
a `slug` exists, and nothing warns when it does not.

⚠️ **`phaseType` and `phaseId` are both optional and exactly one is present in practice** — enforced by
nothing. Authored data has `phaseType`; an app-side brewable has `phaseId`. Both being optional is what
lets one type serve as the supertype of both, and the type admits a record carrying **neither**, which
would place the assignment nowhere.

⚠️ **The `resource` members, in declaration order** — remember `resourceType` is the only thing that
tells them apart:

| # | Shape | Is |
|---|---|---|
| 1 | `{name, weight}` | A **grain** — just a mass. |
| 2 | `{name, weight, alpha, boil, phase?}` | A **hop** — mass, alpha acid, and `boil` as the time it stays in. `phase?` is a kb-only extra the app's transform drops. |
| 3 | `{name, avg_attn, temp, starter}` | A **yeast** — average attenuation, a **single** temperature (not the catalog's range), and whether a starter is called for. |
| 4 | `{name, boil?, weight?}` | An **additive** — both measures optional, because an additive is dosed either by time in the boil or by weight, not both. |

⚠️ **Member 3 is the second yeast shape**, and it shares nothing with `KbYeast` but `name`. The catalog
entry has `temp: [string, string]` and no attenuation; this has `temp: Scalar` and `avg_attn: Scalar`.
Neither type references the other. A screen that wants a strain's range *and* its attenuation has to
read both and join them on the name.

---

# Tier 2 — real shapes, corpus too thin to infer from

`KbRecipe` has one instance in the corpus and `KbRecipeTemplate` has two — both of which carry an empty
`assignments` array. What follows is therefore the **intended** contract, read off the type and off the
app's use of it in `packages/app/src/transform/`, with the corpus used only where it actually says
something.

## `KbRecipe`

```ts
interface KbRecipe extends Entity {
    __type: "kbRecipe" | "recipe";
    name: string;
    brewer: string;
    description: string;
    type: string;
    batchSize: Scalar;
    boilTime: Scalar;
    efficiency: Scalar;
    targets: { og: Scalar; fg: Scalar; abv: Scalar; ibu: string; srm: string; };
    brewable: KbBrewable;
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbRecipe" \| "recipe"` | required | Discriminator, **a two-member union** — see _[the discriminator unions](#the-two-discriminator-unions)_. |
| `name` | `string` | required | The recipe's title as a brewer reads it. |
| `brewer` | `string` | required | Who is credited with it. |
| `description` | `string` | required | Free prose — the style, the intent, what to expect. |
| `type` | `string` | required | The style/category. ⚠️ **A bare string with no vocabulary anywhere.** |
| `batchSize` | `Scalar` | required | Finished volume the recipe is written for. Every quantity downstream is implicitly relative to it; nothing scales automatically. |
| `boilTime` | `Scalar` | required | How long the boil runs — a duration `Scalar` (`min`). Distinct from a hop assignment's own `boil`, which is that addition's time *in* the boil. |
| `efficiency` | `Scalar` | required | Expected brewhouse efficiency, a percent `Scalar`. What the grain bill's yield is predicated on. |
| `targets` | object | required | The numbers the brew is aiming at — see below. |
| `brewable` | [`KbBrewable`](#kbbrewable-kbschedule-kbbrewablephase) | required | The plan itself: phases, their equipment, and every ingredient assignment. Since ingredient arrays were removed from this type, **this is the only place a recipe's ingredients live**. |

### `targets`

| Field | Type | Meaning |
|---|---|---|
| `og` | `Scalar` | Target original gravity — the pre-fermentation reading. |
| `fg` | `Scalar` | Target final gravity. |
| `abv` | `Scalar` | Target alcohol by volume, a percent `Scalar`. |
| `ibu` | `string` | Target bitterness. ⚠️ **A bare `string`, not a `Scalar`** — no unit field, despite `IBU` existing in core's `Unit` vocabulary. |
| `srm` | `string` | Target colour. ⚠️ Same — a bare `string`, with `SRM` likewise a legal `Unit` that is not used here. |

⚠️ **The one shipped recipe pairs specific-gravity values with a Plato unit.** It reads
`og: {"value": "1.05°P", "unit": "°P"}` and `fg: {"value": "1.014°P", "unit": "°P"}`. Those are SG
numbers: 1.050 SG is roughly 12.4 °P, and 1.014 SG is roughly 3.6 °P — an unfermented wort does not sit
at 1.05 °P. `bin/validate.js` accepts it because `°P` is a legal unit and the validator never checks
that a value suits the unit beside it. This is a **data-quality finding recorded here, not something to
fix**; a consumer converting on the strength of `unit` gets a wrong answer from a record that validates.

⚠️ **`type` is `"amber_lager"` in the one recipe** — snake_case, and no vocabulary is declared in either
repo. There is no enum, no validator list, and no prose list to check a new value against. Do not infer
one from a single sample, and do not invent one: treat `type` as free text until someone declares
otherwise.

## `KbRecipeTemplate`

```ts
interface KbRecipeTemplate extends Entity {
    __type: "kbRecipeTemplate";
    name: string;
    description: string;
    brewable: KbBrewable;
}
```

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbRecipeTemplate"` | required | Discriminator. **A single literal**, unlike `KbRecipe`'s — which is why narrowing code tests the template case first, per _Model boundary_. |
| `name` | `string` | required | The template's title. |
| `description` | `string` | required | What the template is for. |
| `brewable` | [`KbBrewable`](#kbbrewable-kbschedule-kbbrewablephase) | required | The starting plan. |

A template is a `KbRecipe` minus everything quantitative — no `batchSize`, no `boilTime`, no
`efficiency`, no `targets`, no `brewer`. It is a **process skeleton**: a brewer picks one to get the
phases and their equipment, then supplies the numbers and ingredients themselves.

⚠️ **Both templates in the corpus carry zero assignments.** So the whole of a template's contribution
today is its phase/equipment skeleton. Whether a template is *meant* to seed ingredients is not
answerable from the data — the type permits it and nothing exercises it.

⚠️ **Do not tell a template from a recipe by sniffing for a field.** `__type` is the answer; the reason
a field check silently inverts is [_Model
boundary_](../app/CLAUDE.md#model-boundary-kb-vs-app-models)'s.

---

# Tier 3 — well-populated and unsurprising

Every field present in every file. One line each.

## `KbGrain`

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbGrain"` | required | Discriminator. |
| `name` | `string` | required | The malt as a brewer names it — and the name an assignment's `slug` matches on. |
| `lovibond` | `number` | required | Colour contribution, degrees Lovibond. ⚠️ **A bare `number`, not a `Scalar`** — see below. |
| `origin` | `string` | required | Maltster or region. |
| `notes` | `string` | required | Free prose — flavour, typical proportion, what it suits. |

## `KbHop`

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbHop"` | required | Discriminator. |
| `name` | `string` | required | The variety — and the assignment join key. |
| `alpha` | `number` | required | Alpha acid, as a percentage figure. ⚠️ **A bare `number`, not a `Scalar`** — and note the *assignment*'s hop resource carries `alpha` as a `Scalar`. |
| `origin` | `string` | required | Growing region. |
| `notes` | `string` | required | Free prose — aroma and flavour character. |
| `usage` | `string` | required | What the hop is used for — bittering, aroma, dual-purpose. |

⚠️ **`notes` and `usage` have no stated boundary.** Neither the type nor the data draws a line between
them, and nothing prevents the same sentence landing in either. Read them as two prose fields a data
author fills by habit, not as a modelled distinction.

## `KbAdditive`

| Field | Type | Declared | Meaning |
|---|---|---|---|
| `__type` | `"kbAdditive"` | required | Discriminator. |
| `name` | `string` | required | The additive — and the assignment join key. |
| `type` | `string` | required | What kind it is (water salt, clarifier, nutrient…). A loose string, like `KbRecipe.type`, with no declared vocabulary. |
| `dosage` | `string` | required | How much to use. ⚠️ **A prose `string`, not a `Scalar`** — it is guidance ("1 tsp per 5 gal"), not a measured value. |
| `stage` | `string` | required | When to add it. A loose string; **not** guaranteed to match a `KbBrewablePhase.type`. |
| `notes` | `string` | required | Free prose — effect, cautions. |

⚠️ **Additives are the one resource family with no catalog dropdown in the app** — a brewer types the
name freehand, which is the practical reason a `slug` can miss the catalog entirely.

## `lovibond` and `alpha` are bare numbers

Everything else measured in this system is a [`Scalar`](../core/MODELS.md#scalar). These two are plain
`number`s, so they carry no unit and no display string: a consumer formats them itself and has to know
that `lovibond` means °L and `alpha` means percent. `alpha` is the sharper case — the same brewing
quantity is a `Scalar` on a hop *assignment* and a bare `number` on the hop *catalog entry*, so code
moving between the two converts by hand.

---

## The two discriminator unions

`KbRecipe.__type` is `"kbRecipe" | "recipe"` and `KbEquipment.__type` is `"kbEquipment" | "equipment"`.
The second member of each is the **app's own** tag: the app's `Recipe extends KbRecipe`, so the base
type has to admit its subtype's discriminator for the extension to be assignable.

⚠️ The cost is that a `KbRecipe` tagged `"recipe"` is not statically distinguishable from an app
`Recipe` by its tag alone, so narrowing has to test the single-literal side rather than the union side.
The rule that follows from this is stated once, in [`packages/app/CLAUDE.md`, _Model
boundary_](../app/CLAUDE.md#model-boundary-kb-vs-app-models) — read it there.

## Findings recorded, not fixed

Everything below is a documented fact about the data or the types as they stand. **Nothing here was
changed by the work that wrote this file** — no type edit, no data edit. They are recorded so a reader
is not surprised, and are separate maintainer follow-ups rather than open work items on this doc.

1. `data/yeasts/wyeast-2112.json` is `{"name": "Wyeast 2112"}` against a `KbYeast` declaring three more
   fields required — and it is the yeast the one shipped recipe pitches.
2. `KbAssignment.slug` holds a **display name**, not the catalog id its own JSDoc implies; the
   assignment→catalog join is a name match.
3. One slug, `"Yeast Nutrients"`, has **no catalog file at all** in any resource directory.
4. Catalog filenames — which *are* the ids — mix separators within a single resource:
   `northern_brewer.json` and `bramling_cross.json` beside `amarillo.json` and `cascade.json`.
5. `data/recipes/anchor-steam-beer-clone.json` and both recipe templates hand-author an `"id"`, which
   `brewdocs.beer-kb`'s own `CLAUDE.md` bans (ids are derived from filenames).
6. The one recipe's `targets.og`/`targets.fg` pair specific-gravity **values** with a `°P` **unit**, and
   the validator passes it because it never checks a value against its unit.
7. `KbRecipe.type` (`"amber_lager"`) and `KbAdditive.type`/`stage` are loose strings with no vocabulary
   declared in either repo.
8. `KbEquipment.count` is populated on 1 file of 18.
9. `KbAssignment` carries both `phaseType?` and `phaseId?` with *"exactly one is present in practice"*
   enforced by nothing — the type admits a record with neither.
10. The same brewing concept has two unrelated shapes in two places: yeast (`KbYeast` vs the assignment
    resource), equipment (`KbEquipment` vs `KbBrewablePhase.equipment`), and alpha acid (`number` vs
    `Scalar`).
