# Equipment list

**Purpose.** The equipment a brewer can outfit a brew day with — both the catalogue's and their
own.

## Behaviours

**EQUIPMENT-LIST-01** — The list offers two ways to narrow what it holds — *All* and *My
Equipment*. *All* holds the catalogue's equipment and the brewer's own together; *My Equipment*
holds only the brewer's own, and a catalogue item never appears there.

**EQUIPMENT-LIST-02** — Every item, wherever it came from, is listed the same way: its name, its
notes and its count. Choosing one opens that item.

**EQUIPMENT-LIST-03** — On the combined list the only thing that tells a catalogue item from one
of the brewer's own is that only their own offer deletion. Nothing else marks which is which.

**EQUIPMENT-LIST-04** — The list can be searched, and it narrows as the brewer types. Nothing has
to be submitted, and emptying the box restores the full list.

**EQUIPMENT-LIST-05** — A search matches an item's name, disregarding case, anywhere in the name
rather than only at its start.

**EQUIPMENT-LIST-06** — A search the brewer has typed stays put when they move between *All* and
*My Equipment*, and narrows whichever of them they land on.

> *Why:* the two are ways of looking at one collection rather than two screens, so a brewer who
> has narrowed to the piece of kit they are after and then wonders "is that one mine?" should not
> have to type it again to find out.

**EQUIPMENT-LIST-07** — Deleting one of the brewer's own equipment items first asks them to
confirm. The confirmation names the item being deleted, says the action cannot be undone, and
offers both cancelling and confirming. The item is only removed once the brewer confirms.

> *Why:* the name is what makes the confirmation worth anything — a brewer with several similar
> pieces of kit, two kettles or two thermometers, is exactly who is most likely to delete the
> wrong one, and there is no undo.

**EQUIPMENT-LIST-08** — That confirmation appears centred on screen, at a readable width, over
the list it interrupts.

**EQUIPMENT-LIST-09** — Catalogue items offer no delete affordance at all. Only a brewer's own
equipment can be deleted.

**EQUIPMENT-LIST-10** — Following a link to an equipment item that no longer exists — a deleted
item, a stale bookmark, a mistyped id, a link shared after a purge — returns the brewer to this
list, with the page's normal navigation intact, rather than an error screen. This holds whether
the link was to view the item or to edit it.

> *Why:* an equipment item stops existing by ordinary means — it was deleted, or the store was
> purged — so meeting a link to it should read as the app staying usable, not as something
> broken.

**EQUIPMENT-LIST-11** — A brewer can start a new item from *My Equipment*, and is asked for a
name before anything is created. There is no template to choose — equipment has no templates the
way a recipe does.

**EQUIPMENT-LIST-12** — Dismissing that prompt rather than confirming it — closing it, or
pressing escape — creates no equipment item, whatever was typed into it. Opening it again starts
from a blank name.

**EQUIPMENT-LIST-13** — Confirming without having typed a name, or having typed only spaces,
still creates the item, under the default name the prompt offers.

> *Why:* the point at which a brewer is naming a new piece of kit is before they have used it,
> which is often the point at which they least know what to call it. Refusing to proceed would
> put a naming decision in front of the work.

**EQUIPMENT-LIST-14** — Confirming creates the item and takes the brewer straight to it, rather
than leaving them on the list.

**EQUIPMENT-LIST-15** — The new item is the brewer's own from that moment: it appears among their
own equipment and on the combined list, carries the name they gave it, and can be edited and
deleted like any equipment they added themselves.

**EQUIPMENT-LIST-16** — At a wide enough screen — a laptop or desktop — the list arranges its
equipment into a grid of several cards per row, rather than one per line. Narrowed to a
phone-sized screen, it returns to a single column, one card per row.

## Known gaps

_None._

## Out of scope

- Reading an item once it is opened, and what Edit does when it is chosen — specified as
  Equipment overview.
- The per-recipe/per-batch equipment panel reached from Recipe Edit and Batch Planning, and its
  own note field — a different, already-shipped area, specified separately in
  `packages/spec/product/equipment.md`. That document is not this one.
- Linking equipment usage into batches or recipes — e.g. showing which batches used a given item.
