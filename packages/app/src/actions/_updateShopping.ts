import {CURRENCIES, Scalar, Unit} from "@brewdocs.beer/core";
import {resourcesOf} from "@/actions/_updateRecipe";
import Batch, {ShoppingItem, ShoppingTag} from "@/model/batch";
import {groupBy, isEqual} from "@/utils/func";
import {parseNumberString} from "@/utils/math";

/** the fields this action owns; everything else on an item belongs to the user */
type Derived = Pick<ShoppingItem, "name"|"tags"|"scalar">;

type Weighed = { name: string; weight: Scalar };

const itemKey = ({ tags, name }: Derived|ShoppingItem) => `${tags[0]}:${name}`;

/** one row per name, weights summed, keeping the unit the ingredient was entered in */
function weighed(tag: ShoppingTag, items: Weighed[]): Derived[] {
    const groups = groupBy(items, "name");
    return Object.keys(groups).map(name => {
        const [, unit] = parseNumberString(groups[name][0].weight.value);
        const total = groups[name].reduce((sum, item) => sum + parseNumberString(item.weight.value)[0], 0.0);
        return { name, tags: [tag], scalar: { value: `${total}${unit}`, unit: unit as Unit } };
    });
}

/** ingredients that aren't weighed — deduped so a repeated name is a single row */
function named(tag: ShoppingTag, items: { name: string }[]): Derived[] {
    return [...new Set(items.map(({ name }) => name))].map(name => ({ name, tags: [tag] }));
}

/**
 * Rebuilds the flat shopping list from the batch's ingredients.
 *
 * Items are matched against the previous list by `tag:name` so user-owned
 * fields (cost, purchased) survive a recalculation. When nothing this action
 * owns has changed, the *previous object* is reused by reference — that keeps
 * updateBatch's isEqual check cheap and stops an untouched shopping list from
 * looking dirty on every save.
 */
export default function _updateShopping(batch: Partial<Batch>): Partial<Batch> {
    const previous = new Map((batch.shopping ?? []).map(item => [itemKey(item), item]));
    const assignments = batch.brewable?.assignments ?? [];

    const derived: Derived[] = [
        ...weighed("hops", resourcesOf(assignments, "hop")),
        ...weighed("grains", resourcesOf(assignments, "grain")),
        ...named("yeasts", resourcesOf(assignments, "yeast")),
        ...named("additives", resourcesOf(assignments, "additive"))
    ];

    return Object.assign(batch, {
        shopping: derived.map((item): ShoppingItem => {
            const prior = previous.get(itemKey(item));

            if (!prior) {
                return {
                    ...item,
                    cost: { value: "$0.00", currency: CURRENCIES.DOLLAR },
                    purchased: false
                };
            }

            // derived data untouched → hand back the same object
            if (isEqual(prior.tags, item.tags) && isEqual(prior.scalar, item.scalar)) {
                return prior;
            }

            // derived data moved (e.g. a weight was edited) → refresh it, keep cost/purchased
            return { ...prior, ...item };
        })
    });
}
