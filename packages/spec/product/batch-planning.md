# Batch Planning

**Purpose.** Where a brewer arranges a batch's ingredients, equipment and phases — the plan
they'll work from on brew day — before or during brewing.

## Behaviours

**BATCH-PLANNING-01** — Planning is the first tab on a batch screen, and the one a brewer lands
on right after brewing a recipe.

**BATCH-PLANNING-02** — Planning holds three sub-tabs: **Ingredients**, **Equipment** and
**Phases**. Ingredients is the one shown by default.

**BATCH-PLANNING-03** — The Ingredients sub-tab groups the batch's ingredients under each phase,
and within a phase, further groups them by kind: Grains on a Mash phase, Hops on a Boil phase,
Yeasts on a Ferment phase. Additives are offered on every phase, regardless of its type.

**BATCH-PLANNING-04** — A Carbonation or Conditioning phase offers only Additives on the
Ingredients sub-tab — no Grains, Hops or Yeasts section, since those kinds belong to Mash, Boil
and Ferment respectively.

**BATCH-PLANNING-05** — Grains, Hops and Yeasts are added by picking a name from a catalog
dropdown scoped to that phase, then confirming; Additives are added by typing a free-text name
instead, with no catalog behind them.

**BATCH-PLANNING-06** — Confirming an add action while its catalog dropdown still reads
"-- Select --", or while its free-text name is empty, does nothing: no row is added, and the
picker/field is left as it was.

**BATCH-PLANNING-07** — Every ingredient row shows a weight field, editable in place, and a
button that removes that row from its phase.

**BATCH-PLANNING-08** — A Hop or Additive row carries a **Show assignment details** control that
reveals a **Boil** time field once expanded (a Grain row has no such control — it carries only its
weight). A Hop's expanded details also show an **Alpha %** field. A Yeast row's own **Show
assignment details** reveals **Attenuation %** and a fermentation temperature field instead.

**BATCH-PLANNING-09** — Ingredients within a phase appear in the order they were added, and
Planning offers no control to reorder them — only to add or remove.

> *Why:* consistent with the brew-day schedule reading that order back rather than imposing its
> own (packages/spec/product/batch-schedule.md, BATCH-SCHEDULE-09) — Planning is where that order
> is set, by the sequence a brewer adds things in.

**BATCH-PLANNING-10** — The Equipment sub-tab groups a batch's equipment the same way — under
each phase — but offers the full equipment catalog on every phase type, including Carbonation and
Conditioning.

**BATCH-PLANNING-11** — Adding equipment to a phase works the same way as adding a catalog
ingredient: pick from a dropdown scoped to that phase, then confirm; confirming with nothing
picked does nothing.

**BATCH-PLANNING-12** — Every equipment row shows its own dropdown, seeded with the item currently
assigned. Picking a different catalog item there swaps that row to the new item in place — the
row count for the phase doesn't change, and no new row is added.

**BATCH-PLANNING-13** — Every equipment row also carries a free-text notes field, editable in
place, and a button that removes that row from its phase. Picking a catalog item that carries a
seeded default note (for example, "Keg (Coke) - 5.5gal") fills the notes field with that default
when the row is added.

**BATCH-PLANNING-14** — Ingredients and equipment stay fully editable — add, remove, rename,
reweigh, edit notes — no matter how far the batch has progressed on brew day, including after
every phase has been completed.

> *Why:* only the Phases sub-tab locks once brewing has begun (BATCH-PLANNING-17) — a brewer who
> under- or over-poured, or wants to correct a typo in a note, isn't locked out of fixing it once
> the corresponding phase is checked off.

**BATCH-PLANNING-15** — The Phases sub-tab lists every phase in order, each with **Move up** and
**Move down** controls; the first phase's **Move up** and the last phase's **Move down** are
disabled, since there's nowhere to move them. Moving a phase renumbers every phase's position
label immediately.

**BATCH-PLANNING-16** — An **Add phase** control appends a new phase of a picked type (Mash,
Boil, Ferment, Carbonation or Conditioning) to the end of the list. A phase can be removed only
when another phase of the same type already exists — the last instance of a required type shows
no **Remove** control for it at all, rather than a disabled one.

**BATCH-PLANNING-17** — Once any phase on the batch has been marked complete on the brew-day
schedule, the entire Phases sub-tab locks: every **Move**, **Remove** and **Add phase** control
becomes disabled, and hovering one shows "Locked — a phase has already been completed". Merely
starting the brew-day timer, without completing a phase, does not trigger this lock.

> *Why:* the plan is what the brew-day schedule is built from; changing phase order or count
> after work has already been checked off against it would leave the schedule referring to a plan
> that no longer matches what was actually brewed.

**BATCH-PLANNING-18** — A phase with nothing assigned to it yet shows no placeholder or empty-state
message on either the Ingredients or Equipment sub-tab — just the phase's section header and its
add row, with no items listed under it.

## Known gaps

- Collapsing a phase's section on the Equipment sub-tab and then reordering phases does not keep
  the collapse state on the same phase — it follows the phase's position on screen instead, so
  reordering can leave the wrong section collapsed. — [#1136](https://github.com/matt-whitaker/brewdocs.beer/issues/1136)

## Out of scope

- The reusable ingredient/equipment/phase editor itself, as used by Recipe Editing — its own
  story; this document covers only what Planning does with it.
- The brew-day schedule that Planning's plan feeds into, including checkoffs, readings and phase
  completion itself — packages/spec/product/batch-schedule.md.
- Shopping and Summary — each is its own story.
