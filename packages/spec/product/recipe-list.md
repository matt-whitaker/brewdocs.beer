# Recipe list

**Purpose.** The recipes a brewer can brew from — both the catalogue's and their own.

## Behaviours

**RECIPE-LIST-01** — Deleting one of the brewer's own recipes first asks them to confirm. The
confirmation names the recipe being deleted, says the action cannot be undone, and offers both
cancelling and confirming. The recipe is only removed once the brewer confirms.

> *Why:* the name is what makes the confirmation worth anything. A brewer with several
> variations of one beer is exactly the person most likely to delete the wrong one, and there
> is no undo.

**RECIPE-LIST-02** — That confirmation appears centred on screen, at a readable width, over the
list it interrupts.

**RECIPE-LIST-03** — Catalogue recipes offer no delete affordance at all. Only a brewer's own
recipes can be deleted.

**RECIPE-LIST-04** — Following a link to a recipe that no longer exists — a deleted recipe, a
stale bookmark, a mistyped id, a link shared after a purge — returns the brewer to this list,
with the page's normal navigation intact, rather than an error screen. This holds whether the
link was to view the recipe or to edit it.

> *Why:* a recipe stops existing by ordinary means — it was deleted, or the store was purged —
> so meeting a link to it should read as the app staying usable, not as something broken.

**RECIPE-LIST-05** — The list offers three ways to narrow what it holds — *All*, *Starred* and
*My Recipes*. *All* holds the catalogue's recipes and the brewer's own together; *My Recipes*
holds only the brewer's own, and a catalogue recipe never appears there.

**RECIPE-LIST-06** — Every recipe, wherever it came from, is listed the same way: its name, who
it is credited to, its headline figures — ABV, IBUs, original gravity and final gravity — and its
description. Choosing one opens that recipe.

**RECIPE-LIST-07** — On the combined list the only thing that tells a catalogue recipe from one
of the brewer's own is that only their own offer deletion. Nothing else marks which is which.

> *Why:* this is a promise the app currently keeps by accident rather than by design, and it is
> worth stating so that a change to it is a decision. A brewer whose own recipe began as a copy
> of a catalogue one may be holding two cards with the same name (see RECIPE-OVERVIEW-16), and
> the delete affordance is then the whole difference between them.

**RECIPE-LIST-08** — The chosen one of the three travels with the link to the list: reloading the
page, or following a link shared from it, returns to the one that was open rather than resetting
to *All*.

**RECIPE-LIST-09** — The list can be searched, and it narrows as the brewer types. Nothing has to
be submitted, and emptying the box restores the full list.

**RECIPE-LIST-10** — A search matches a recipe's name, disregarding case, anywhere in the name
rather than only at its start — searching *out* finds *Winter Stout*.

**RECIPE-LIST-11** — A search the brewer has typed stays put when they move between *All* and
*My Recipes*, and narrows whichever of them they land on.

> *Why:* the two are ways of looking at one collection rather than two screens, so a brewer who
> has narrowed to the beer they are after and then wonders "is that one mine?" should not have to
> type it again to find out.

**RECIPE-LIST-12** — A brewer can start a new recipe from their own recipes, and is asked for a
name and a starting template before anything is created.

**RECIPE-LIST-13** — That prompt appears centred on screen, at a readable width, over the list it
interrupts.

**RECIPE-LIST-14** — Dismissing that prompt rather than confirming it — closing it, or pressing
escape — creates no recipe, whatever was typed into it. Opening it again starts from a blank name
and the empty template.

**RECIPE-LIST-15** — Confirming without having typed a name, or having typed only spaces, still
creates the recipe, under the name the prompt offered — *New Recipe*.

> *Why:* the point at which a brewer is naming a recipe is before they have brewed it, which is
> often the point at which they least know what to call it. Refusing to proceed would put a
> naming decision in front of the work.

**RECIPE-LIST-16** — The template chosen decides the equipment the new recipe starts with — a
kettle sour arrives with the kit a kettle sour needs — and the empty template starts it with no
equipment at all.

**RECIPE-LIST-17** — Confirming creates the recipe and takes the brewer straight into editing it,
rather than leaving them on the list.

**RECIPE-LIST-18** — The new recipe is the brewer's own from that moment: it appears among their
own recipes and on the combined list, carries the name they gave it, and can be edited, brewed
and deleted like any recipe they wrote.

**RECIPE-LIST-19** — At a wide enough screen — a laptop or desktop — the list arranges its
recipes into a grid of several cards per row, rather than one per line. Narrowed to a
phone-sized screen, it returns to a single column, one card per row.

## Known gaps

- The *Starred* tab is offered but permanently disabled, and there is nowhere on the screen to
  star a recipe in the first place. Either starring works, or the tab is not offered. — #899
- Nothing is shown when there is nothing to show — a brewer with no recipes yet, and a search
  that matches nothing, both get a search box over blank space, which reads the same as a screen
  that failed to load. — #900
- Recipes appear in no order a brewer can predict — neither the order they were created in nor
  alphabetical. — #901
- A search ignores the brewer and the description, both of which the card is showing, so a brewer
  can search for text they are looking straight at and be told there is nothing. — #902
- A creation template changes only the equipment. Every new recipe gets the same phases —
  mash, boil, ferment — so *Kettle Sour* brings the kit for a kettle sour and the schedule for an
  ordinary ale. — #903

## Out of scope

- Reading a recipe once it is opened, and what editing does when it is chosen — specified as
  Recipe Overview.
- What a brewer can change inside the recipe editor, which RECIPE-LIST-17 only opens.
- Starring a recipe, and what the *Starred* tab would list — the tab does not work (#899), so
  there is no behaviour to record.
