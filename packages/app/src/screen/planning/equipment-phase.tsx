import {ChecklistItem} from "@/model/batch";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import PlanningEquipmentRow from "@/screen/planning/equipment-row";
import PlanningEquipmentAddRow from "@/screen/planning/equipment-add-row";

export type PlanningEquipmentPhaseProps = {
    /** index into batch.phases */
    phase: number;
    name: string;
    items: ChecklistItem[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
}
export default function PlanningEquipmentPhase({ phase, name, items, add, remove, update }: PlanningEquipmentPhaseProps) {
    const session = useSession();
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");
    const sessionKey = `planning.equipment.${name}`;

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    const rows = useMemo(() => items.map((item: ChecklistItem, i) => (
        <PlanningEquipmentRow
            key={`equipment-${name}-${item.name}-${i}`}
            phase={phase}
            row={i}
            item={item}
            remove={remove}
            update={update}
            equipment={equipmentCatalog}
            equipmentIndex={equipmentIndex} />
    )), [items, phase, name, remove, update, equipmentIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[sessionKey] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                {name}
            </DataGridHeaderRow>
            {rows}
            <PlanningEquipmentAddRow phase={phase} add={add} equipment={equipmentCatalog} equipmentIndex={equipmentIndex} />
        </DataGrid>
    )
}
