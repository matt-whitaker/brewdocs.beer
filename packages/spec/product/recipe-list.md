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

## Known gaps

_None._

## Out of scope

- Searching and filtering the list, and how catalogue and personal recipes are separated —
  real behaviours of this screen, but not yet specified by any story.
- Creating and editing a recipe.
