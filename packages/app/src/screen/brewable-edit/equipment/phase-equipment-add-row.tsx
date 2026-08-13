import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import Equipment from "@/model/equipment";

export type RecipeEditPhaseEquipmentAddRowProps = {
    /** index into brewable.schedule.phases */
    phase: number;
    phaseLabel: string;
    add: AddFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
};

export default function RecipeEditPhaseEquipmentAddRow({ phase, phaseLabel, add, equipment, equipmentIndex }: RecipeEditPhaseEquipmentAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addItem = useCallback(() => {
        if (!selection) return;
        const item = equipmentIndex.get(selection)!;
        add(`schedule.phases[${phase}].equipment`, { name: item.name, notes: item.notes });
        setSelection(null);
    }, [add, phase, equipmentIndex, selection]);

    return (
        <AddRow<Equipment>
            data={equipment}
            value={selection}
            onChange={setSelection}
            add={addItem}
            addLabel={`Add equipment to ${phaseLabel}`}
        />
    );
}
