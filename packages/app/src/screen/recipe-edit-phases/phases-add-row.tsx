import {useCallback, useMemo, useState} from "react";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {PHASE_TYPES, PhaseType} from "@/model/brewable";

export type RecipeEditPhasesAddRowProps = {
    add: AddFn;
};

// a phase type, not a catalog item — repeats are allowed (mash -> boil -> mash),
// so this never disables an already-used type
export default function RecipeEditPhasesAddRow({ add }: RecipeEditPhasesAddRowProps) {
    const [type, setType] = useState<PhaseType|null>(null);
    const options = useMemo(() => PHASE_TYPES.map(value => ({ value, name: `${value[0].toUpperCase()}${value.slice(1)}` })), []);

    const addPhase = useCallback(() => {
        if (!type) return;
        add("brewable.schedule.phases", { type, equipment: [] });
        setType(null);
    }, [add, type]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton onClick={addPhase} />
            <DataGridLabel className="ml-6" cols={4}>
                <DataGridSelect
                    allowNull
                    data={options}
                    value={type}
                    onChange={value => setType(value as PhaseType)}
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
