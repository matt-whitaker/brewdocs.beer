# MODELS.md

Field-by-field reference for [`src/models.ts`](src/models.ts) — the primitives every other package's
models are built on. `Entity` is what a stored record is; `Scalar` is what a measured value is; `Unit`
and `Currency` are the vocabularies a `Scalar` may name.

⚠️ **This file states shape. Mechanism and *why* stay in a `CLAUDE.md`** — the migration framework,
the kb→app transform boundary, the formatting helpers. Where one of those is involved, this file
links to it rather than restating it.

## `Entity`

The base a persisted record extends. Nothing else in `models.ts` refers to it — it is the storage
contract, not part of `Scalar`.

```ts
interface Entity {
    id: string;
    version?: number;
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `id` | `string` | yes | The record's persisted id — the key it is stored and looked up under. Opaque: no format is imposed here. |
| `version` | `number` | no | Which shape of the record this is. **Missing means version `1`** — the "oldest known" version, never an error. |

- `version` is what makes a stored record carryable forward through a shape change instead of being
  purged. The framework that reads it — the `Migration` contract, its registry and runner, and which
  domains are wired into it today — is documented in
  [`packages/app/CLAUDE.md`, _Data compatibility_](../app/CLAUDE.md#data-compatibility-versioned-entities--migration).

## `Scalar`

A measured value: a weight, a volume, a temperature, a gravity reading, a price.

```ts
interface Scalar {
    value: string;
    unit?: Unit;
    currency?: Currency;
}
```

⚠️ **`value` is the full display string, including the unit — not a bare number.** `"9.0lb"`,
`"1.050 SG"`, `"60min"`, `"$4.50"`. This is the single convention every downstream consumer depends
on (kb data authors it this way, app models carry it through unchanged), and it is the one to check
first when a value renders wrong.

| Field | Type | Required | Meaning |
|---|---|---|---|
| `value` | `string` | yes | The full display string, unit included. May be empty (`""`) — a field a brewer has cleared or not yet filled. |
| `unit` | [`Unit`](#unit--units) | no | Which unit `value` is expressed in — a parsing/fallback hint, **not** the source of truth for what is displayed. |
| `currency` | [`Currency`](#currency--currencies) | no | The same, for a monetary value. |

- `unit` and `currency` are alternatives in practice — a scalar carries one or the other, or neither
  (a bare count). Nothing in the type enforces that.
- Being a *hint* means two things: a reader that needs a number parses `value` (`parseFloat`) rather
  than composing one from the fields, and a writer that has to re-format a bare number the brewer
  typed reads `unit` to decide which unit to append. Both behaviours live in the app — see
  [`packages/app/CLAUDE.md`, _Model boundary_](../app/CLAUDE.md#model-boundary-kb-vs-app-models).
- Nothing guarantees `value` and `unit` agree; they can be written independently, and a mismatch is
  not a type error.
- `unit`/`currency` are string-literal unions — subtypes of `string` — which is what lets raw kb JSON
  cross the type boundary with a validated cast rather than a mapping pass. The validators are
  [`isUnit`/`isCurrency`](#isunit--iscurrency).

## `Unit` / `UNITS`

`UNITS` is the `as const` object; `Unit` is the union of its **values** (the symbols), not its keys —
`UNITS.POUNDS` is `"lb"`, and `Unit` admits `"lb"`.

| Symbol | Const | Measures |
|---|---|---|
| `%` | `PERCENT` | Percent — a proportion (alpha acid, attenuation, efficiency) |
| `L` | `LITERS` | Volume |
| `mL` | `MILLILITERS` | Volume |
| `gal` | `GALLONS` | Volume |
| `qt` | `QUARTS` | Volume |
| `pt` | `PINTS` | Volume |
| `tsp` | `TEASPOONS` | Volume — small/kitchen measure |
| `tbsp` | `TABLESPOONS` | Volume — small/kitchen measure |
| `cup` | `CUPS` | Volume — small/kitchen measure |
| `oz` | `OUNCES` | Mass |
| `g` | `GRAMS` | Mass |
| `kg` | `KILOGRAMS` | Mass |
| `lb` | `POUNDS` | Mass |
| `°F` | `FAHRENHEIT` | Temperature |
| `°C` | `CELSIUS` | Temperature |
| `SG` | `SPECIFIC_GRAVITY` | Gravity |
| `°P` | `PLATO` | Gravity |
| `IBU` | `IBU` | Bitterness |
| `SRM` | `SRM` | Colour |
| `pH` | `PH` | Acidity |
| `min` | `MINUTES` | Time |
| `psi` | `PSI` | Pressure |
| `ppm` | `PARTS_PER_MILLION` | Concentration — water chemistry |

⚠️ **`Unit` is one flat union with no grouping by what it measures.** There is no `MassUnit` or
`TemperatureUnit`; nothing stops `"lb"` being assigned where a temperature was expected, and nothing
stops a `Scalar` pairing `value: "150°F"` with `unit: "lb"`. Whether a unit makes sense in a given
field is the call site's to know.

⚠️ **`oz` is mass**, the weight of a hop or grain addition — not fluid ounces. There is no fluid-ounce
unit in this vocabulary.

### Duplicated in `brewdocs.beer-kb`

The [`brewdocs.beer-kb`](https://github.com/matt-whitaker/brewdocs.beer-kb) repo — where the kb data
itself lives — keeps its **own copy** of this unit and currency vocabulary, by policy. The operative
copy there is its `bin/validate.js`, which checks kb data field values against it; the prose copy is
its own `CLAUDE.md`.

⚠️ **Adding, renaming or removing a unit or currency here requires a matching change there.**
Nothing in this repo enforces the two staying in sync, and nothing here fails when they drift — a
symbol this package accepts but kb's validator does not will simply not survive kb's build, and one
kb emits that this package does not know will fail `isUnit` at the type boundary.

## `Currency` / `CURRENCIES`

Same shape as `UNITS`: `CURRENCIES` is the `as const` object, `Currency` the union of its symbols.
Used by a `Scalar`'s `currency` field for monetary values (shopping-list costs).

| Symbol | Const | Currency |
|---|---|---|
| `$` | `DOLLAR` | Dollar |
| `€` | `EURO` | Euro |
| `£` | `POUND` | Pound sterling |
| `¥` | `YEN` | Yen |
| `₹` | `RUPEE` | Rupee |
| `₩` | `WON` | Won |
| `₣` | `FRANC` | Franc |
| `₱` | `PESO` | Peso |
| `₺` | `LIRA` | Lira |
| `₿` | `BITCOIN` | Bitcoin |

- The symbol is the identity, so symbols that several real currencies share (`$`, `¥`) are one entry
  — there is no locale or ISO code here to tell them apart.
- Same flatness caveat as `Unit`: nothing pairs a `currency` with a locale or a format.

## `isUnit` / `isCurrency`

```ts
const isUnit = (value: string): value is Unit
const isCurrency = (value: string): value is Currency
```

Runtime guards. Each takes a raw `string` — typically a field read out of kb JSON, or a suffix
parsed off something a brewer typed — and narrows it to the literal type when the value is one of
the symbols in the table above. Membership only: neither guard says anything about whether the unit
suits the field it is headed for.

They are the sanctioned way across the type boundary. A raw string cast straight to `Unit` compiles
and admits anything.
