import {useCallback, useState} from "react";
import {CURRENCIES} from "@brewdocs.beer/core";
import {InputSelectOption, InputText} from "@brewdocs.beer/design";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {ShoppingItem, ShoppingTag} from "@/model/batch";

export type BatchShoppingAddRowProps = {
    tagOptions: InputSelectOption[];
    defaultTag: ShoppingTag;
    add: AddFn;
};

export default function BatchShoppingAddRow({ tagOptions, defaultTag, add }: BatchShoppingAddRowProps) {
    const [name, setName] = useState("");
    const [tag, setTag] = useState<ShoppingTag>(defaultTag);

    const addItem = useCallback(() => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const item: ShoppingItem = {
            name: trimmed,
            tags: [tag],
            source: "user",
            cost: { value: "$0.00", currency: CURRENCIES.DOLLAR },
            purchased: false
        };

        add("shopping", item);
        setName("");
    }, [add, name, tag]);

    const onChangeTag = useCallback((value: string) => setTag(value as ShoppingTag), []);

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
            <DataGridSelect
                cols={2}
                label="New shopping item type"
                data={tagOptions}
                value={tag}
                onChange={onChangeTag}
            />
        </DataGridRow>
    );
}
