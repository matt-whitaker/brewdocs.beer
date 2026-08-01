import {useCallback, useMemo, useState} from "react";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn} from "@/hooks/useJsonEdit";
import {BrewablePhase, OPTIONAL_PHASE_TYPES, PHASE_TYPES, PhaseType} from "@/model/brewable";
import {newId} from "@/utils/id";

export type RecipeEditPhasesAddRowProps = {
    add: AddFn;
};

// a phase type, not a catalog item — repeats are allowed (mash -> boil -> mash),
// so this never disables an already-used type
export default function RecipeEditPhasesAddRow({ add }: RecipeEditPhasesAddRowProps) {
    const [type, setType] = useState<PhaseType|null>(null);
    const options = useMemo(() => [...PHASE_TYPES, ...OPTIONAL_PHASE_TYPES].map(value => ({ value, name: `${value[0].toUpperCase()}${value.slice(1)}` })), []);

    const addPhase = useCallback(() => {
        if (!type) return;
        // ⚠️ Typed as a full BrewablePhase on purpose: `AddFn` takes `unknown`, so a
        // missing `id`/`milestones` would sail past tsc and only surface at runtime
        // as a silent save failure (liveTrackerKeys reading `milestones` of undefined).
        // The id is minted here because assignments reference a phase *instance*.
        const phase: BrewablePhase = { id: newId(), type, equipment: [], milestones: [] };
        add("schedule.phases", phase);
        setType(null);
    }, [add, type]);

    return (
        <DataGridRow zebra reserveExpand>
            <DataGridAddButton label="Add phase" onClick={addPhase} />
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
