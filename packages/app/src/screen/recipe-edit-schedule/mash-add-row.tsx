import {useCallback, useState} from "react";
import {UNITS} from "@brewdocs.beer/core";
import {InputText} from "@brewdocs.beer/design";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {AddFn} from "@/hooks/useJsonEdit";

export type RecipeEditMashAddRowProps = {
    add: AddFn;
};

// mash steps are recipe-authored, not picked from a catalog — freeform like a
// batch phase (see planning/phases-add-row.tsx)
export default function RecipeEditMashAddRow({ add }: RecipeEditMashAddRowProps) {
    const [name, setName] = useState("");
    const trimmed = name.trim();

    const addStep = useCallback(() => {
        if (!trimmed) return;
        add("mash", {
            name: trimmed,
            temp: { value: `0${UNITS.FAHRENHEIT}`, unit: UNITS.FAHRENHEIT },
            time: { value: `0${UNITS.MINUTES}`, unit: UNITS.MINUTES },
            grains: "all",
        });
        setName("");
    }, [add, trimmed]);

    return (
        <DataGridRow zebra>
            <DataGridAddButton onClick={addStep} />
            <DataGridLabel className="ml-6" cols={4}>
                <InputText
                    value={name}
                    onChange={setName}
                    placeholder="New mash step name"
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
