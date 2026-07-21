import {useMemo} from "react";
import {ChecklistItem} from "@/model/batch";
import {AddFn, RemoveFn, ToggleFn, UpdateFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import ScheduleEquipmentRow from "@/screen/schedule/equipment-row";
import ScheduleEquipmentAddRow from "@/screen/schedule/equipment-add-row";

export type ScheduleEquipmentProps = {
    /** index into batch.phases — the edit paths' real position */
    phase: number;
    phaseName: string;
    items: ChecklistItem[];
    toggle: ToggleFn;
    update: UpdateFn;
    add: AddFn;
    remove: RemoveFn;
}

/**
 * What to have ready before a phase starts. Sits above the phase's grids as its
 * own DataGrid — the grid boundary is what would scope a collapse to these rows
 * rather than the ingredient groups below (same pattern as the shopping groups).
 * Editable the same way as Planning's hops/grains/yeasts: pick from a catalog,
 * remove, or add a row — the add-row always renders so an empty phase still has
 * a way to add its first item.
 */
export default function ScheduleEquipment({ phase, phaseName, items, toggle, update, add, remove }: ScheduleEquipmentProps) {
    const rows = useMemo(() => items.map(({ name, completed }, row) => (
        <ScheduleEquipmentRow
            key={`equipment-${name}-${row}`}
            phase={phase}
            phaseName={phaseName}
            row={row}
            name={name}
            completed={completed}
            toggle={toggle}
            update={update}
            remove={remove} />
    )), [items, phase, phaseName, toggle, update, remove]);

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible>Equipment</DataGridHeaderRow>
            {rows}
            <ScheduleEquipmentAddRow phase={phase} add={add} />
        </DataGrid>
    );
}
