import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import {Units} from "@brewdocs.beer/core";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridAddButton from "@/component/data-grid/add-button";
import {AddFn} from "@/hooks/useJsonEdit";

export type RecipeEditBoilAddRowProps = {
    add: AddFn;
};

// boil steps are recipe-authored, not picked from a catalog — freeform like a
// batch phase (see planning/phases-add-row.tsx)
export default function RecipeEditBoilAddRow({ add }: RecipeEditBoilAddRowProps) {
    const [name, setName] = useState("");
    const trimmed = name.trim();

    const addStep = useCallback(() => {
        if (!trimmed) return;
        add("boil", {
            name: trimmed,
            time: { value: `0${Units.MINUTES}`, unit: Units.MINUTES },
            hops: "all",
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
                    placeholder="New boil step name"
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
