import Batch, {ShoppingItem, ShoppingTag} from "@/model/batch";
import {ScreenH1} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import DataGridSelect from "@/component/data-grid/select";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import useJsonEdit from "@/hooks/useJsonEdit";
import {saveSession, useSession} from "@/state/session";
import {useBatch} from "@/state/batches";
import {Fragment, useCallback, useMemo} from "react";

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

export type ShoppingProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function Shopping({ batchId, onChange }: ShoppingProps) {
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

    const shoppingRows = useMemo(() => ordered.map(({ item, index }, i) => {
        const group = groupOf(item, sort);
        const previousGroup = i > 0 ? groupOf(ordered[i - 1].item, sort) : null;
        const id = `shopping-item-${item.tags[0]}-${item.name}`;

        return (
            <Fragment key={id}>
                {group && group !== previousGroup && <DataGridHeaderRow>{group}</DataGridHeaderRow>}
                <DataGridRow zebra>
                    <DataGridLabel className="flex items-center" htmlFor={id}>
                        <DataGridCheckbox
                            id={id}
                            checked={item.purchased}
                            onChange={() => toggle(`shopping.[${index}].purchased`)} />
                        {item.name}{item.scalar ? ` - ${item.scalar.value}` : ""}
                    </DataGridLabel>
                    <DataGridInput
                        col={3}
                        value={item.cost.value}
                        onChange={(value: string) => update(`shopping.[${index}].cost.value`, value)}
                        onBlur={(value: string) => updateScalar(`shopping.[${index}].cost`, value, true)}
                    />
                </DataGridRow>
            </Fragment>
        );
    }), [ordered, sort, toggle, update, updateScalar]);

    return (
        <Screen>
            <ScreenH1>Shopping List</ScreenH1>
            <DataGrid>
                <DataGridRow>
                    <DataGridLabel className="flex items-center gap-x-2 col-span-6">
                        <span className="shrink-0">Sort by</span>
                        <DataGridSelect
                            value={sort}
                            data={SORT_OPTIONS}
                            onChange={onChangeSort}
                        />
                    </DataGridLabel>
                </DataGridRow>
                {shoppingRows}
            </DataGrid>
        </Screen>
    );
}
