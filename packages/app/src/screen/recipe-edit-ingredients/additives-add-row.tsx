import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridAddButton from "@/component/data-grid/add-button";
import {AddFn} from "@/hooks/useJsonEdit";
import {RecipeAdditive} from "@/screen/recipe-edit-ingredients/additives-row";

export type RecipeEditAdditivesAddRowProps = {
    add: AddFn;
};

// freeform, like planning's phases add-row: there's no additive catalog, so
// the name is typed rather than picked
export default function RecipeEditAdditivesAddRow({ add }: RecipeEditAdditivesAddRowProps) {
    const [name, setName] = useState("");

    const trimmed = name.trim();

    const addAdditive = useCallback(() => {
        if (!trimmed) return;
        const additive: RecipeAdditive = { name: trimmed, boil: { value: "15min", unit: "min" } };
        add("additives", additive);
        setName("");
    }, [add, trimmed]);

    return (
        <DataGridRow zebra>
            <DataGridAddButton onClick={addAdditive} />
            <DataGridLabel className="ml-6">
                <InputText
                    value={name}
                    onChange={setName}
                    placeholder="New additive name"
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
