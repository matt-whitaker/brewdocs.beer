import {useCallback, useMemo, useState} from "react";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {BrewablePhase, OPTIONAL_PHASE_TYPES, PHASE_TYPES, PhaseType} from "@/model/brewable";
import {PHASES_LOCKED_REASON} from "@/screen/brewable-edit/phases/locked";
import {newId} from "@/utils/id";

export type RecipeEditPhasesAddRowProps = {
    add: AddFn;
    /** true once the batch has progressed — the plan stays visible but not editable */
    locked?: boolean;
};

export default function RecipeEditPhasesAddRow({ add, locked = false }: RecipeEditPhasesAddRowProps) {
    const [type, setType] = useState<PhaseType|null>(null);
    const options = useMemo(() => [...PHASE_TYPES, ...OPTIONAL_PHASE_TYPES].map(value => ({ value, name: `${value[0].toUpperCase()}${value.slice(1)}` })), []);

    const addPhase = useCallback(() => {
        if (!type) return;

        const phase: BrewablePhase = { id: newId(), type, equipment: [], milestones: [] };
        add("schedule.phases", phase);
        setType(null);
    }, [add, type]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton label="Add phase" title={locked ? PHASES_LOCKED_REASON : undefined} disabled={locked} onClick={addPhase} />
            <DataGridLabel className="ml-6" cols={4}>
                <DataGridSelect
                    label="Phase type to add"
                    allowNull
                    data={options}
                    value={type}
                    onChange={value => setType(value as PhaseType)}
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
