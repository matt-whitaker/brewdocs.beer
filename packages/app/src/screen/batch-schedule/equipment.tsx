import {memo, useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import Equipment from "@/model/equipment";
import {TrackerEntry, key} from "@/model/tracker";

type BatchScheduleEquipmentItemProps = {
    item: Equipment;
    completed: boolean;
    onToggle: (id: string) => void;
};

function BatchScheduleEquipmentItem({ item, completed, onToggle }: BatchScheduleEquipmentItemProps) {
    const id = item.id!;
    const domId = `equipment-${id}`;
    const toggleItem = useCallback(() => onToggle(id), [onToggle, id]);

    return (
        <DataGridRow zebra>
            {}
            <DataGridLabel className="flex items-center col-span-6" htmlFor={domId}>
                <DataGridCheckbox
                    id={domId}
                    checked={completed}
                    onChange={toggleItem} />
                {item.name}
            </DataGridLabel>
        </DataGridRow>
    );
}

const Item = memo(BatchScheduleEquipmentItem);

export type BatchScheduleEquipmentProps = {
    items: Equipment[];
    tracker: Record<string, TrackerEntry>;
    onToggle: (id: string) => void;
};

/**
 * What to have ready before a phase starts. Sits above the phase's grids as its
 * own DataGrid — the grid boundary is what would scope a collapse to these rows
 * rather than the ingredient groups below (same pattern as the shopping groups).
 */
export default function BatchScheduleEquipment({ items, tracker, onToggle }: BatchScheduleEquipmentProps) {
    const rows = useMemo(() => items.map(item => (
        <Item
            key={item.id}
            item={item}
            completed={tracker[key({ on: "equipment", id: item.id! })]?.completed ?? false}
            onToggle={onToggle} />
    )), [items, tracker, onToggle]);

    if (!items.length) return null;

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible>Equipment</DataGridHeaderRow>
            {rows}
        </DataGrid>
    );
}
