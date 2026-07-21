import Equipment from "@/model/equipment";
import {SchedulePhase} from "@/model/batch";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";

export type BatchPlanningEquipmentAddRowProps = {
    /** index into batch.phases */
    phase: number;
    schedulePhase: SchedulePhase;
    add: AddFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
}

export default function BatchPlanningEquipmentAddRow({ phase, schedulePhase, add, equipment, equipmentIndex }: BatchPlanningEquipmentAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addItem = useCallback(() => {
        if (!selection) return;
        add(`phases[${phase}].equipment`, equipmentToScheduleItem(equipmentIndex.get(selection)!, schedulePhase));
        setSelection(null);
    }, [add, phase, schedulePhase, equipmentIndex, selection]);

    return (
        <AddRow<Equipment>
            data={equipment}
            value={selection}
            onChange={setSelection}
            add={addItem}
        />
    );
}
