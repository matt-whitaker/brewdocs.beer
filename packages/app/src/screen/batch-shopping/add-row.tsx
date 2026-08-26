import {useCallback, useState} from "react";
import {CURRENCIES} from "@brewdocs.beer/core";
import {InputText} from "@brewdocs.beer/design";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {AddFn} from "@/hooks/useJsonEdit";
import {ShoppingItem, ShoppingTag} from "@/model/batch";

export type BatchShoppingAddRowProps = {
    resolveTag: (name: string) => ShoppingTag;
    add: AddFn;
};

export default function BatchShoppingAddRow({ resolveTag, add }: BatchShoppingAddRowProps) {
    const [name, setName] = useState("");

    const addItem = useCallback(() => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const item: ShoppingItem = {
            name: trimmed,
            tags: [resolveTag(trimmed)],
            source: "user",
            cost: { value: "$0.00", currency: CURRENCIES.DOLLAR },
            purchased: false
        };

        add("shopping", item);
        setName("");
    }, [add, name, resolveTag]);

    return (
        <DataGridRow zebra>
            <DataGridAddButton label="Add shopping item" onClick={addItem} />
            <DataGridLabel className="ml-6" cols={3}>
                <InputText
                    className="w-full"
                    primary
                    label="New shopping item"
                    value={name}
                    onChange={setName}
                    placeholder="Item name"
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
