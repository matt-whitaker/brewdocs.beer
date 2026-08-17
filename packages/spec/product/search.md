# Search

**Purpose.** One place to find anything the brewer has, or anything in the knowledge base,
without knowing in advance which list it lives on.

## Behaviours

~~**SEARCH-01**~~ — *retired: visiting "/" always shows the everywhere-search box now
(SEARCH-02) — there is no separate hero shown only when a query param is absent.*

**SEARCH-02** — Visiting "/" shows a single search box — no tabs alongside it — right-aligned
at the top of a fixed-width column that holds its position and width whether the space below it
is empty, full of recent batches, or full of search results. The placeholder is "What are you
looking for?", and the box has no accessible name of its own beyond that placeholder, since it
is the only control on the page before the brewer types.

**SEARCH-03** — Typing into the box returns results as the brewer types. Nothing has to be
submitted, and clearing the box returns to the empty state (SEARCH-08).

**SEARCH-04** — Results render as a grid of tiles, taller than wide, each reserving space for
an icon — a placeholder today, since no entity carries its own icon yet — above the entity's
name. Choosing a tile takes the brewer straight to that entity's own page: a batch, one of the
brewer's own recipes, one of the brewer's own equipment items, or a knowledge-base hop, grain,
yeast, equipment item or recipe — whichever kind matched.

> *Why:* the brewer isn't told in advance which kind of thing matched, so every card has to be
> equally choosable regardless of what it turns out to be — a knowledge-base hop and one of the
> brewer's own batches are answered the same way.

**SEARCH-05** — A query matches an entity whose name contains it, disregarding case and
matching anywhere in the name rather than only at the start — searching *citr* finds *Citra*.

**SEARCH-06** — A query also matches an entity that doesn't itself carry the query in its name,
but contains an ingredient — a grain, hop, yeast or additive — whose name does — a recipe or a
batch built around Citra shows up for a search of *citr* even though "Citra" is not that
recipe's or batch's own name.

> *Why:* a brewer hunting for "what did I brew with that hop again?" is asking about the hop,
> not naming the recipe or batch that used it — the match has to work from the ingredient
> outward.

**SEARCH-07** — When both kinds of match occur for one query, every entity matched by its own
name is listed before any entity matched only through an ingredient it contains.

> *Why:* the thing the brewer typed is more likely to be the thing they meant than something
> merely containing an ingredient by that name, so it earns the first look.

**SEARCH-08** — With the box empty, the page never shows the no-match message (SEARCH-09) —
instead it shows the brewer's recent batches (SEARCH-10) if any exist, or nothing at all if
none do. Either way, nothing here could be mistaken for a stalled or empty search.

**SEARCH-09** — A query that matches nothing shows the message "Nothing found." rather than the
same blank space an empty query leaves — so a brewer can tell "nothing here yet" from "nothing
found".

**SEARCH-10** — With the box empty and at least one batch already brewed, up to eight of the
most recently brewed batches show as tiles under a "Recent batches" heading, most recently
brewed first — a starting point rather than a blank page. Typing anything replaces this with
search results (SEARCH-03).

**SEARCH-11** — Visiting "/" with an unrecognized query string, such as the retired
`?search=everywhere`, shows the same screen as visiting "/" alone — the param is inert rather
than changing what renders or producing an error.

## Known gaps

_None._

## Out of scope

- Searching the knowledge base's additives — they have no page of their own to link to, so they
  fall outside "search everywhere" entirely.
- Any tab or panel-switcher behaviour on this page — it deliberately has none.
- Real, per-entity-kind icons — only that each card reserves the space for one.
- Fuzzy or typo-tolerant matching, and any debouncing or performance tuning of the search
  itself.
