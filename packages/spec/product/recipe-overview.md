# Recipe overview

**Purpose.** Where a brewer reads a recipe — the catalogue's or one of their own — and decides to
brew it or to change it.

## Behaviours

**RECIPE-OVERVIEW-01** — A recipe opens on its overview, which shows the recipe's name, who it is
credited to, its headline figures — ABV, IBUs, original gravity and final gravity — and its
description.

**RECIPE-OVERVIEW-02** — The overview lists the recipe's ingredients grouped by kind — hops,
grain, yeast, additives — each group naming the ingredients it holds.

**RECIPE-OVERVIEW-03** — A catalogue recipe and one of the brewer's own read identically: the same
figures, the same ingredient grouping, the same actions offered. Nothing about *reading* a recipe
depends on where the recipe came from.

> *Why:* the difference between the two is what a brewer may **do** with them, and it surfaces
> only in Edit. A brewer holding their own variation against the catalogue original is comparing
> two beers, and should not also have to reconcile two layouts.

**RECIPE-OVERVIEW-04** — A recipe offers two views of itself — its overview, and the batches
brewed from it — and the brewer can move between them without leaving the recipe.

**RECIPE-OVERVIEW-05** — The chosen view travels with the link to the recipe: reloading the page,
or following a link shared from it, returns to the view that was open rather than resetting to the
overview.

**RECIPE-OVERVIEW-06** — The batches view lists only the batches brewed from this recipe. A batch
brewed from a different recipe never appears there, however alike the two recipes are — including
when one is a copy of the other under the same name.

> *Why:* this is the only place a brewer can ask "how has this recipe gone before?", and a copy of
> a catalogue recipe keeps the original's name by default, so identical names are the ordinary
> case rather than a contrived one.

**RECIPE-OVERVIEW-07** — Choosing to brew a recipe asks the brewer to name the batch first. The
prompt names the recipe being brewed.

**RECIPE-OVERVIEW-08** — That prompt offers a name the brewer can accept as it stands, and the
offered name counts up with the batches already brewed from that recipe — the first is *Batch #1*,
the next *Batch #2*.

> *Why:* brewing the same recipe repeatedly is the normal case, and a brewer who accepts the
> offered name every time must still end up with batches they can tell apart afterwards.

**RECIPE-OVERVIEW-09** — Dismissing that prompt instead of confirming it creates no batch.

**RECIPE-OVERVIEW-10** — Confirming creates the batch and takes the brewer straight to it, at the
start of the brew, rather than leaving them on the recipe.

**RECIPE-OVERVIEW-11** — The new batch starts with the recipe's ingredients already laid out
across the phases of the brew — grains in the mash, hops and additives in the boil, yeast at
fermentation — carrying their quantities with them, so a brewer never re-enters a recipe they
have just chosen to brew.

**RECIPE-OVERVIEW-12** — A batch keeps a way back to the recipe it was brewed from, and that is
the recipe actually brewed — the catalogue's, or the brewer's own copy of it, whichever they
started from.

**RECIPE-OVERVIEW-13** — A batch appears, as soon as it is brewed, both in that recipe's batches
view and in the brewer's list of every batch, ready to be started.

**RECIPE-OVERVIEW-14** — Editing one of the brewer's own recipes opens the editor on that recipe.

**RECIPE-OVERVIEW-15** — Editing a catalogue recipe instead asks for a name and gives the brewer a
copy to work on, opening the editor on the copy. The catalogue recipe itself is unchanged and
stays in the catalogue.

> *Why:* the catalogue is shared ground a brewer did not write. Editing it in place would either
> have to refuse the change or quietly alter what the catalogue says, and a brewer adapting a
> published recipe wants their own version of it either way.

**RECIPE-OVERVIEW-16** — That copy is the brewer's own from the moment it is made: it carries the
original's details, appears among their own recipes, and can be brewed, edited and deleted like
any recipe they wrote themselves.

**RECIPE-OVERVIEW-17** — A recipe names itself above the screen and offers the way back to the
recipe list from there, in both views.

## Known gaps

- A recipe's batches view shows nothing at all when the recipe has no batches — a search box over
  blank space — and the brew action is hidden on that view, so there is no way forward from it.
  It should say the recipe has not been brewed yet, and let the brewer brew it. — #863
- Editing a catalogue recipe offers the catalogue recipe's exact name for the copy, so a brewer
  who accepts it ends up with two cards in the recipe list that are identical in every visible
  respect. The copy should be tellable apart at a glance. — #864

## Out of scope

- The recipe list itself — what it shows, how it is searched, starred and filtered.
- The recipe editor — what a brewer can actually change once Edit has opened it. This area covers
  only what Edit does when it is chosen.
- The batch's own screens — planning, shopping, brewing and summary — beyond the state a batch is
  in at the moment it is brewed.
- Following a link to a recipe that no longer exists: already specified as RECIPE-LIST-04.
- How the batch list orders and filters batches, which belongs to that screen.
