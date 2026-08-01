# DESIGN.md

The design system, in prose. `README.md` is the short entry point (stack + exports); this is the long-form companion — what the tokens and components actually are today, and why. Written from the code as it stands; where the system hasn't caught up with itself, that's called out as a **Known gap**, not smoothed over.

## Foundations / stack

- **Tailwind v4**, CSS-first — no `tailwind.config.*`, no PostCSS config. Configuration lives inline in CSS via `@import "tailwindcss"`, `@theme {}`, and `@plugin`.
- **DaisyUI v5** on the `nord` theme, loaded as a Tailwind plugin: `@plugin "daisyui" { themes: nord --default; }`.
- **`design` declares no Tailwind/DaisyUI of its own.** This package exports React components whose `className` props are plain strings (via `classNames`, from the `classnames` package) — Tailwind/DaisyUI utility classes and DaisyUI component classes (`input`, `select`, `btn`, …). Nothing here compiles CSS; `app` and `www` do, each with their own `styles.css`/`global.css` importing Tailwind and DaisyUI themselves.
- Because the classes only exist as strings until a consumer's Tailwind run scans them, and workspace deps are symlinked (Tailwind's auto-detection skips `node_modules`), both consumers carry a load-bearing source directive: `@source "../../design/src";` (`packages/app/src/styles.css:6`, `packages/www/src/styles/global.css:4`). Drop it and every class this package emits silently stops generating — no build error, just missing styles.
- Today's actual token source of truth is **`packages/app/src/styles.css`** (13 lines of theme tokens) with **`packages/www/src/styles/global.css`** as a thinner subset (font + theme name only, no SRM scale, no custom breakpoint/leading/text tokens). See **Known gaps**.

## Color

### Semantic roles (DaisyUI `nord`)

DaisyUI's semantic color roles are theme variables (`--color-primary`, `--color-base-100`, etc.), resolved per the active theme (`nord`, the only theme configured: `packages/app/src/styles.css:9`). Used via the standard Tailwind color utilities (`bg-primary`, `text-base-content`, …). Observed usage across the app gives a sense of intent, though nothing enforces it beyond convention:

| Role | Used for |
|---|---|
| `primary` | Emphasis accents — the `ScreenH1` background band (`bg-primary/60`), the `primary` prop on `InputText`/`InputDate`/`InputSelect` (adds `input-primary`), active/highlighted text (`text-primary`) |
| `secondary` | Secondary emphasis text (`text-secondary`) — sparse, one observed use |
| `neutral` | Neutral surfaces/text (`bg-neutral`, `text-neutral`) |
| `base-100` / `base-200` / `base-300` | Surface layering — `base-200` shows up as a subtle panel/border background (`bg-base-200`, `border-base-200`); `base-100`/`base-300` exist as the theme's other two surface steps but weren't found in current app usage |
| `base-content` | Body text on a `base-*` surface, frequently dimmed via opacity (`text-base-content/60`, `/70` — e.g. `component/data-grid/header-row.tsx:11`) for secondary/label text |
| `info` / `success` / `warning` / `error` | DaisyUI's status roles — defined by the theme, not yet observed in app usage |

None of these roles are re-exported or wrapped by `design` — consumers use the DaisyUI/Tailwind class names directly.

### The SRM beer-color scale

Thirteen custom theme colors modeling the [Standard Reference Method](https://en.wikipedia.org/wiki/Standard_Reference_Method) beer-color scale, defined as `@theme` tokens in `packages/app/src/styles.css:16-28` (not currently duplicated in `www`):

| Token | Hex | Name |
|---|---|---|
| `--color-beer-1` | `#F3F993` | Pale Straw |
| `--color-beer-3` | `#F5F75C` | Straw |
| `--color-beer-6` | `#F6F513` | Pale Gold |
| `--color-beer-9` | `#EAE615` | Deep Gold |
| `--color-beer-12` | `#E0D01B` | Light Amber |
| `--color-beer-15` | `#D5BC26` | Amber |
| `--color-beer-18` | `#CDAA37` | Deep Amber |
| `--color-beer-20` | `#C1963C` | Copper |
| `--color-beer-24` | `#BE823A` | Deep Copper |
| `--color-beer-30` | `#C17A37` | Brown |
| `--color-beer-35` | `#BC6733` | Ruby Brown |
| `--color-beer-40` | `#8D4A43` | Deep Brown |
| `--color-beer-50` | `#5D3B2E` | Black (fallback value) |

The numeric suffix is an SRM value (1–50+), not a shade index — Tailwind's `bg-beer-*`/`border-beer-*`/`outline-beer-*` utilities are generated straight from the token names, so `bg-beer-24` means "the swatch for SRM 24," not "24% of some base color." `--color-beer-50` is explicitly the fallback for any SRM at or above the top of the modeled range.

**Real usage** (in `packages/design/src/components/srm-avatar/`, with an app-side re-export shim at `packages/app/src/component/srm-avatar/`): `constants.tsx` maps each SRM breakpoint to its `[bg, border, outline]` class triple and exports `findSrmClasses`, which picks the first breakpoint `>=` the batch's computed SRM (falling back to SRM 40 if none match). Two components read it, and they are the only place today that reads the scale as a *scale* rather than a fixed palette — start from `findSrmClasses` if you build a third:

- `SrmAvatar` (`srm-avatar/index.tsx`) — the large standalone swatch, using the `bg` + `outline` classes for its outline ring.
- `SrmTag` (`srm-tag/index.tsx`) — a small `aria-hidden` inline swatch (`size-3.5`) for a dense data-grid row, using only the `bg` class plus a hairline `border-base-content/20` for legibility against the page background. It normalizes a non-finite `srm` to the lowest breakpoint rather than falling through to the SRM 40 bucket.

**What it's for:** color-coding recipes/batches by their beer color (an amber ale vs. a stout) — visually communicating a KB or app-model `srm` field without a numeric readout.

## Typography

**Font:** `Urbanist Variable`, via `@theme { --font-sans: "Urbanist Variable", ui-sans-serif, system-ui, sans-serif; }` (`packages/app/src/styles.css:13`, mirrored in `packages/www/src/styles/global.css:11`). The variable font file ships as the `@fontsource-variable/urbanist` package and is loaded with a bare side-effecting import — `import "@fontsource-variable/urbanist";` in `packages/app/src/main.tsx:13` and `packages/www/src/layouts/Layout.astro:2` — not a `<link>` tag or `@font-face` rule in either stylesheet.

**Scale** (`packages/design/src/components/typography/index.tsx`) — five heading levels plus one paragraph component, each a fixed class string (no size prop; compose by choosing the right component):

| Component | Size | Notable classes |
|---|---|---|
| `ScreenH1` | `text-2xl` | `bg-primary/60 rounded-box -mx-2 px-2 py-1` — the only heading with a background band, used as the page's "title bar" (see `CLAUDE.md`'s Breadcrumbs section — most routes don't render an `<h1>` at all since the breadcrumb trail *is* the title) |
| `ScreenH2` | `text-2xl` | plain |
| `ScreenH3` | `text-xl` | `leading-tight` |
| `ScreenH4` | `text-md` (DaisyUI/Tailwind alias for `text-base`) | `font-semibold leading-tight` |
| `ScreenH5` | inherited (no `text-*` class) | `capitalize` only |
| `ScreenP` | inherited | `mt-1` |

All six apply `capitalize` (`ScreenP` doesn't — body copy isn't title-cased) and take the standard `className` escape hatch (`PropsWithClass`).

**Vertical rhythm** is encoded directly in each component's class string as sibling/pseudo-class selectors — there's no shared spacing scale object, the rules just live in the Tailwind arbitrary-variant syntax:

- `mt-5`/`mt-3`/`mt-2`/`mt-1` — each level's default top margin, roughly proportional to its size.
- `first:mt-0` (`H1`, `H2`) — no top margin when the heading opens its container.
- `[&+h2]:mt-0`, `[&+h3]:mt-0` (on `H1`/`H2` respectively) — an `H1` immediately followed by an `H2` (or `H2`→`H3`) collapses the child's margin, so a title and its immediate subtitle sit tight together.
- `[&+h4]:mt-1` (on `H3`) — an `H3`→`H4` pair gets a small (not zero) gap.
- `[&.cozy]:mt-0` (`H3`, `H4`, `H5`) — an opt-in `cozy` class consumers can add to zero out the top margin outside the automatic sibling cases above. **Known gap:** no current call site in `packages/app` or `packages/www` passes `cozy` — the hook exists in `design` but is unused today.
- `[&+p]:mt-0` + `first-of-type:mt-0` (`ScreenP`) — consecutive paragraphs and a leading paragraph both collapse their top margin.

**Custom text/leading tokens**, all defined in `packages/app/src/styles.css:32-37` only (not in `www`):

- `--leading-11: 2.75rem` / `--leading-12: 3rem` — extend Tailwind's `leading-*` scale (which stops at `leading-10`) for large-line-height cases. No current call site in either app's `src` — defined but not yet consumed.
- `--text-2xs: 0.6875rem` — one step below Tailwind's built-in `text-xs` (0.75rem). The comment at `styles.css:35-36` gives the reason: it matches DaisyUI's own bespoke `--font-size-min`, the font size `input-xs`/`select-xs` render at, so a label sitting next to an `-xs` control lines up instead of looking oversized. Used today in `packages/app/src/component/data-grid/label.tsx:10` and `header-row.tsx:11` for small uppercase labels next to compact controls.

## Spacing & layout

There's no bespoke spacing scale — everything is stock Tailwind spacing utilities (`p-`, `px-`, `py-`, `mt-`, `mx-`, `gap-`), used ad hoc per component. The `design` components themselves lean on small, consistent paddings: `InputText` (`px-1 lg:px-2.5`) and `InputDate` (`px-1.5 lg:px-2.5`) both widen their horizontal padding at the `lg` breakpoint to match the larger control size rendered there (see **Components** below).

**Custom breakpoint:** `--breakpoint-xs: 350px` (`packages/app/src/styles.css:30`, `www` has no equivalent) adds an `xs:` variant below Tailwind's default smallest (`sm`, 640px) — for adjustments needed on very narrow phone widths. Live usage is in `packages/app`, not `design`: `xs:ml-2` on a couple of create/edit-recipe name inputs (`component/create-batch-form/index.tsx:21`, `screen/recipe-create-modal/index.tsx:28`, `screen/recipe-edit-modal/index.tsx:28`) nudges the field right of a preceding icon/label once there's at least 350px to spare.

**Responsive control-size bumps:** the pattern used throughout `design`'s form inputs is "small on narrow viewports, one size up from `lg` onward" — e.g. `InputText`'s default/medium size is `input-sm` at `lg:` and `input-xs` below it (`packages/design/src/components/input-text/index.tsx:34`). This is a mobile-first density choice (the app's primary surface is a phone-sized brew-day companion) rather than a generic "responsive design" pattern — see **Components** for the full size table.

## Radii & shape

`packages/app/src/styles.css:48-50` sets one radius override:

```css
:root {
    --radius-selector: 0.2rem;
}
```

`--radius-selector` is a DaisyUI theme token (it governs corner rounding on small/square-ish controls — checkboxes, toggles, badges, radio-adjacent selectors). `nord`'s built-in value is `1rem`, which — per the comment at `styles.css:44-47` — exceeds half the height of these short elements, so CSS's corner-radius clamping rounds them all the way to circles/pills instead of the intended soft-square. `0.2rem` aligns them with `--radius-field`'s look instead.

**⚠️ Why this needs an unlayered rule, not a `@theme` override:** DaisyUI defines its own theme tokens — including `--radius-selector` — inside Tailwind's `base` cascade layer. Tailwind's own `@theme {}` block compiles into the `theme` layer. Cascade layers are ordered independent of source position or specificity, and `base` is declared *after* `theme` in Tailwind's layer order, so anything in `base` always wins over `theme` regardless of what value either side sets. That makes overriding a DaisyUI token from inside `@theme {}` structurally impossible — no `!important`-free rule in `theme` can ever beat one in `base`. The fix is a **plain, unlayered** `:root {}` rule: unlayered CSS outranks *every* cascade layer unconditionally, so it's the one place left that can beat DaisyUI's `base` styles. This is the single most non-obvious rule in the system — if a future token override "does nothing" despite looking correct, check whether it's sitting inside `@theme {}` when it needs to be a bare `:root {}` rule instead.

## Components

All components are function components exporting a named `*Props` type built from `@brewdocs.beer/core`'s prop helpers (`PropsWithClass`, `PropsWithOnChange<T>`, `PropsWithOnBlur<T>`, `PropsWithChildren`) and take an optional `className` that's appended (not replacing) the component's own classes via `classNames(...)`.

### Typography — `ScreenH1`–`ScreenH5`, `ScreenP`

Covered above under **Typography**. Props: `children`, `className`.

### `InputText` (`src/components/input-text/index.tsx`)

A styled `<input type="text">`.

- `value`, `onChange?: (value: string) => void`, `readonly?`, `placeholder?`, `name?`.
- `primary?: boolean` — adds `input-primary`.
- `align?: "left"|"center"|"right"` — `"right"` adds `text-right` and right-aligns the placeholder too (`placeholder:text-right`); `"left"`/`"center"` are accepted by the type but have no class mapping today (**known gap** — only the `right` case is implemented).
- `size?: "small"|"medium"|"large"` — maps to a DaisyUI size pair, small below `lg`, one step up at `lg:` and above: `small` → `input-xs`/`lg:input-sm`, `medium` (default) → `input-sm`/`lg:input-md`, `large` → `input-md`/`lg:input-lg`.
- **Enter-to-blur:** when an `onBlur` prop is present, the component wires a `keydown` handler that calls `currentTarget.blur()` on `Enter` (`index.tsx:28`). This is how "press Enter to commit" works everywhere `InputText` is used with `onBlur` — there's no separate "submit" affordance, blurring the field *is* the commit, and Enter is a shortcut for blurring without a mouse.

### `InputDate` (`src/components/input-date/index.tsx`)

A styled `<input type="date">`. `value`, `onChange?`, `readonly?`, `placeholder?` (defaults to `"MM/DD/YYYY"`), `name?`, `primary?`, `align?` (`right` only, same as `InputText`). Fixed size — `input-xs` below `lg:`, `input-sm` at `lg:` and up; no `size` prop (unlike `InputText`, there's no `small`/`medium`/`large` choice here).

### `InputSelect` (`src/components/input-select/index.tsx`)

A styled `<select>`. `data: {name: string; value?: string}[]`, `value: string|null`, `onChange?`, `allowNull?` (prepends a disabled-feeling `-- Select --` option). Fixed at `select-xs` with **no responsive `lg:` bump** — the one control in the exported set that doesn't grow on larger viewports (**known gap**, or simply not yet needed by any consumer).

### Unexported / in-progress: `input-checkbox`, `input-unit`

`src/components/input-checkbox/index.tsx` exists as an **empty file** — pure scaffolding, no implementation — and its export in `src/index.ts:6` is commented out. `src/components/input-unit/index.tsx` wraps `InputText` to add a `unit` field but its `onChange`/`onBlur` wiring is an unfinished stub (the `_onBlur` callback body is empty and isn't even passed to the underlying `InputText`); it has no export line in `src/index.ts` at all. Treat both as **not part of the current design surface** — don't build on them without finishing the implementation first.

## Contributing

To add a new primitive:

1. Create `src/components/<kebab-name>/index.tsx`. Follow the existing shape: a named `<PascalName>Props` type composed from `@brewdocs.beer/core`'s prop helpers, a named function component (not a default export — `InputText`/`InputDate`/`InputSelect`/the typography set are all named exports), `classNames(...)` merging fixed classes with the incoming `className`.
2. Add `export * from "./components/<kebab-name>";` to `src/index.ts`.
3. Keep class strings valid **DaisyUI v5 / Tailwind v4** — this package doesn't compile or lint them against a running Tailwind build itself; a typo only shows up visually once a consumer (`app`/`www`) builds.
4. If the component needs a token that doesn't exist yet (a new color, breakpoint, spacing value), it has to be added to a **consumer's** `styles.css`/`global.css` `@theme` block, not to anything in `design` — see **Known gaps**.
5. Storybook has been removed from this package (no `storybook` dependency, no script); `src/stories/` is orphaned scaffolding excluded from consumer builds. There's currently no story to add alongside a new component — that's tracked separately (see the parent design-system issue).

## Known gaps

- **Most tokens still live in `app`, not `design`.** `design` now owns the tokens that were byte-identical across consumers — the daisyui `nord` theme and `--font-sans` — via `src/tokens.css`, which `app`/`www` `@import` by bare specifier. Everything else (`--color-beer-*`, `--breakpoint-xs`, `--leading-11`/`--leading-12`, `--text-2xs`, the `--radius-selector` override) is still defined only in `packages/app/src/styles.css`; `design` only *consumes* those through the class strings its components emit, and any `design` component leaning on them (the SRM `bg-beer-*` classes, `text-2xs`) still renders unstyled from `www` today. Migrating the rest is out of scope here — the SRM scale rides with a follow-up issue, the remainder with the broader Tailwind-consolidation research issue.
- **`cozy` and `--leading-11`/`--leading-12` are unused.** The class hooks exist in code but no current screen exercises them — confirm they still do what the comments say before relying on them, and consider removing them if a future audit finds no near-term consumer.
- **`InputText`'s `align` prop only implements `"right"`.** `"left"` and `"center"` type-check but produce no visual change.
- **`InputSelect` doesn't participate in the responsive size convention** the other two inputs use (fixed `select-xs`, no `lg:` bump).
- **`input-checkbox` and `input-unit` are incomplete** and unexported — see **Components** above.
