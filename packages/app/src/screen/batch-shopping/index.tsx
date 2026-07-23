import {useCallback, useMemo} from "react";
import {ScreenH1} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import Batch, {ShoppingItem, ShoppingTag} from "@/model/batch";
import ShoppingItemRow from "@/screen/batch-shopping/item-row";
import {useBatch} from "@/state/batches";
import {saveSession, useSession} from "@/state/session";

type SortKey = "type"|"name"|"purchased";

const SORT_OPTIONS = [
    { value: "type", name: "Type" },
    { value: "name", name: "Name" },
    { value: "purchased", name: "Purchased" }
];

const TAG_LABELS: Record<ShoppingTag, string> = {
    hops: "Hops",
    grains: "Grains",
    yeasts: "Yeasts",
    additives: "Additives"
};

const TAG_ORDER: ShoppingTag[] = ["hops", "grains", "yeasts", "additives"];

/** the sort key doubles as the grouping; "name" is ungrouped */
function groupOf(item: ShoppingItem, sort: SortKey): string|null {
    if (sort === "type") return TAG_LABELS[item.tags[0]] ?? null;
    if (sort === "purchased") return item.purchased ? "Purchased" : "To Buy";
    return null;
}

function compare(a: ShoppingItem, b: ShoppingItem, sort: SortKey): number {
    if (sort === "type") {
        const order = TAG_ORDER.indexOf(a.tags[0]) - TAG_ORDER.indexOf(b.tags[0]);
        if (order !== 0) return order;
    }
    if (sort === "purchased" && a.purchased !== b.purchased) {
        return a.purchased ? 1 : -1; // still to buy first
    }
    return a.name.localeCompare(b.name);
}

export type BatchShoppingProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function BatchShopping({ batchId, onChange }: BatchShoppingProps) {
    const session = useSession();
    const batch = useBatch(batchId);

    const [data, update, updateScalar, toggle] = useJsonEdit<Batch>(batch, onChange);

    const sort = (session?.["shopping.sort"] as SortKey) ?? "type";
    const onChangeSort = useCallback((value: string) => saveSession("shopping.sort", value), []);

    // sort a copy that remembers each item's index, so edit paths keep pointing
    // at the real position in batch.shopping regardless of display order
    const ordered = useMemo(() => data.shopping
        .map((item, index) => ({ item, index }))
        .sort((a, b) => compare(a.item, b.item, sort)), [data.shopping, sort]);

    const shoppingGroups = useMemo(() => {
        // ordered is already sorted, so a group is a run of adjacent items sharing
        // a label; each run becomes its own DataGrid, which is what bounds the
        // collapse rule to that group's rows
        const groups: { label: string|null; entries: typeof ordered }[] = [];
        ordered.forEach(entry => {
            const label = groupOf(entry.item, sort);
            const current = groups[groups.length - 1];
            if (current && current.label === label) current.entries.push(entry);
            else groups.push({ label, entries: [entry] });
        });

        return groups.map(({ label, entries }, i) => (
            <DataGrid key={label ?? `group-${i}`}>
                {label && (
                    <DataGridHeaderRow
                        collapsible
                        defaultCollapsed={session?.[`shopping.${label.toLowerCase()}`] as boolean ?? false}
                        onToggle={collapsed => saveSession(`shopping.${label.toLowerCase()}`, collapsed)}>
                        {label}
                    </DataGridHeaderRow>
                )}
                {entries.map(({ item, index }) => (
                    <ShoppingItemRow
                        key={`${item.tags[0]}-${item.name}`}
                        row={index}
                        item={item}
                        toggle={toggle}
                        update={update}
                        updateScalar={updateScalar}
                    />
                ))}
            </DataGrid>
        ));
    }, [ordered, sort, toggle, update, updateScalar, session]);

    return (
        <Screen>
            <DataGrid className="mt-2">
                <DataGridRow className="border-b-1 pb-2 border-base-200">
                    <DataGridLabel cols={3}>Sort by</DataGridLabel>
                    <DataGridSelect
                        cols={3}
                        value={sort}
                        data={SORT_OPTIONS}
                        onChange={onChangeSort}
                    />
                </DataGridRow>
            </DataGrid>
            {shoppingGroups}
        </Screen>
    );
}
