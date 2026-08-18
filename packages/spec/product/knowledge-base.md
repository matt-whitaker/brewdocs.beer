# Knowledge base

**Purpose.** Where a brewer looks up a grain, hop or yeast from the catalogue — what it is and
what it's like to use — without it belonging to any recipe or batch of their own.

## Behaviours

**KNOWLEDGE-BASE-01** — A grain, hop or yeast catalogue item opens on its own overview screen
when chosen from a search result (SEARCH-04). Today that is the only way to reach one — nothing
else in the app links to a catalogue item's own page, and there is no page to browse a category's
items without first searching for one by name.

**KNOWLEDGE-BASE-02** — The three overviews share one layout: a breadcrumb trail reading
*Knowledge > Grains|Hops|Yeasts > <item name>*, the item's facts, and a short description of the
ingredient underneath them. The item names itself only in that trail — there is no separate page
heading repeating the name.

**KNOWLEDGE-BASE-03** — The facts shown differ by kind: a grain shows its Lovibond color rating
and country of origin; a hop shows its country of origin, alpha acid percentage and its typical
usage; a yeast shows its country of origin and fermentation temperature range.

**KNOWLEDGE-BASE-04** — None of the three overviews offers any action — no edit, no delete, no
way to add the item to a recipe or batch from this screen.

## Known gaps

- A grain, hop or yeast id in the URL that doesn't resolve in the catalogue (stale bookmark,
  typo, a shared link to an item later removed from the kb data) dead-ends on a full-page error
  instead of returning the brewer somewhere useful — the same defect #600 already named for
  batch/recipe ids, whose fix (#607) didn't extend to these three routes. — #1142

## Out of scope

- The `/knowledge` hub itself — a stub today ("Page not implemented"), including the breadcrumb's
  own "Knowledge" link, which currently leads there. Nothing about it is specified until it does
  something.
- The catalogue *recipe* detail screen — it shares its screen with a brewer's own recipes,
  specified in Recipe overview.
- The search box that is the only way to reach one of these screens today — what it matches, how
  results are ranked and shown — already specified in Search.
- The knowledge base's additive entries — they have no page of their own to link to.
