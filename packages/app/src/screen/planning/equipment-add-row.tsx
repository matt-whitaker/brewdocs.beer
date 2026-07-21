import Equipment from "@/model/equipment";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {equipmentToChecklistItem} from "@/transform/equipmentToChecklistItem";

export type PlanningEquipmentAddRowProps = {
    /** index into batch.phases */
    phase: number;
    add: AddFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
}

export default function PlanningEquipmentAddRow({ phase, add, equipment, equipmentIndex }: PlanningEquipmentAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addItem = useCallback(() => {
        if (!selection) return;
        add(`phases[${phase}].equipment`, equipmentToChecklistItem(equipmentIndex.get(selection)!));
        setSelection(null);
    }, [add, phase, equipmentIndex, selection]);

    return (
        <AddRow<Equipment>
            data={equipment}
            value={selection}
            onChange={setSelection}
            add={addItem}
        />
    );
}
