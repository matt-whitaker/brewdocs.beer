import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {ChecklistItem} from "@/model/batch";
import equipmentCatalog from "@/data/equipment";

export type ScheduleEquipmentAddRowProps = {
    /** index into batch.phases */
    phase: number;
    add: AddFn;
}

export default function ScheduleEquipmentAddRow({ phase, add }: ScheduleEquipmentAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addEquipment = useCallback(() => {
        if (!selection) return;
        const item: ChecklistItem = { name: selection, completed: false };
        add(`phases[${phase}].equipment`, item);
        setSelection(null);
    }, [add, phase, selection]);

    return (
        <AddRow
            data={equipmentCatalog}
            value={selection}
            onChange={setSelection}
            add={addEquipment}
        />
    );
}
