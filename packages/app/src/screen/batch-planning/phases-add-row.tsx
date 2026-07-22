import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {AddFn} from "@/hooks/useJsonEdit";

export type BatchPlanningPhasesAddRowProps = {
    add: AddFn;
    existingNames: string[];
};

// freeform, unlike every other AddRow: a phase isn't picked from a catalog, and
// its name is fixed once created (it's the phase's identity), so this is the
// only place a name is ever entered
export default function BatchPlanningPhasesAddRow({ add, existingNames }: BatchPlanningPhasesAddRowProps) {
    const [name, setName] = useState("");

    const trimmed = name.trim();
    const isDuplicate = existingNames.some(existing => existing.toLowerCase() === trimmed.toLowerCase());

    const addPhase = useCallback(() => {
        if (!trimmed || isDuplicate) return;
        // tags: [] matches every schedule item until the user assigns equipment/relevance elsewhere
        add("phases", { name: trimmed, tags: [], equipment: [] });
        setName("");
    }, [add, trimmed, isDuplicate]);

    return (
        <DataGridRow zebra>
            <DataGridAddButton onClick={addPhase} />
            <DataGridLabel className="ml-6" cols={4}>
                <InputText
                    value={name}
                    onChange={setName}
                    placeholder="New phase name"
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
