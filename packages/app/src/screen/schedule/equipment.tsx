import {memo, useCallback, useMemo} from "react";
import {ChecklistItem} from "@/model/batch";
import {ToggleFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridCheckbox from "@/component/data-grid/checkbox";

type ScheduleEquipmentItemProps = {
    /** index into batch.phases */
    phase: number;
    phaseName: string;
    /** index into that phase's equipment */
    row: number;
    name: string;
    completed: boolean;
    toggle: ToggleFn;
}

function ScheduleEquipmentItem({ phase, phaseName, row, name, completed, toggle }: ScheduleEquipmentItemProps) {
    const id = `equipment-${phaseName}-${name}`;
    const toggleItem = useCallback(
        () => toggle(`phases[${phase}].equipment[${row}].completed`),
        [toggle, phase, row]
    );

    return (
        <DataGridRow zebra>
            {/* no value column here, so the label spans the full grid */}
            <DataGridLabel className="flex items-center col-span-6" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={completed}
                    onChange={toggleItem} />
                {name}
            </DataGridLabel>
        </DataGridRow>
    );
}

// props are primitives plus a stable toggle, so ticking one item doesn't
// re-render the rest of the list
const Item = memo(ScheduleEquipmentItem);

export type ScheduleEquipmentProps = {
    /** index into batch.phases — the toggle path's real position */
    phase: number;
    phaseName: string;
    items: ChecklistItem[];
    toggle: ToggleFn;
}

/**
 * What to have ready before a phase starts. Sits above the phase's grids as its
 * own DataGrid — the grid boundary is what would scope a collapse to these rows
 * rather than the ingredient groups below (same pattern as the shopping groups).
 */
export default function ScheduleEquipment({ phase, phaseName, items, toggle }: ScheduleEquipmentProps) {
    const rows = useMemo(() => items.map(({ name, completed }, row) => (
        <Item
            key={name}
            phase={phase}
            phaseName={phaseName}
            row={row}
            name={name}
            completed={completed}
            toggle={toggle} />
    )), [items, phase, phaseName, toggle]);

    if (!items.length) return null;

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible>Equipment</DataGridHeaderRow>
            {rows}
        </DataGrid>
    );
}
