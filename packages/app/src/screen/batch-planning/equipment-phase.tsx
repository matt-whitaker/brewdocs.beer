import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {ScheduleItem, SchedulePhase} from "@/model/batch";
import BatchPlanningEquipmentAddRow from "@/screen/batch-planning/equipment-add-row";
import PlanningEquipmentRow from "@/screen/batch-planning/equipment-row";
import {saveSession, useSession} from "@/state/session";

export type BatchPlanningEquipmentPhaseProps = {
    /** index into batch.phases */
    phase: number;
    /** identity — used for the session key and item keys; stays stable across reorders */
    name: string;
    /** what the header displays, e.g. the numbered phase name */
    label: string;
    /** the phase's own SchedulePhase tag — stamped onto equipment items added here */
    schedulePhase: SchedulePhase;
    items: ScheduleItem[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
};
export default function BatchPlanningEquipmentPhase({ phase, name, label, schedulePhase, items, add, remove, update }: BatchPlanningEquipmentPhaseProps) {
    const session = useSession();
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");
    const sessionKey = `planning.equipment.${name}`;

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    const rows = useMemo(() => items.map((item: ScheduleItem, i) => (
        <PlanningEquipmentRow
            key={`equipment-${name}-${item.name}-${i}`}
            phase={phase}
            schedulePhase={schedulePhase}
            row={i}
            item={item}
            remove={remove}
            update={update}
            equipment={equipmentCatalog}
            equipmentIndex={equipmentIndex} />
    )), [items, phase, schedulePhase, name, remove, update, equipmentIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[sessionKey] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                {label}
            </DataGridHeaderRow>
            {rows}
            <BatchPlanningEquipmentAddRow phase={phase} schedulePhase={schedulePhase} add={add} equipment={equipmentCatalog} equipmentIndex={equipmentIndex} />
        </DataGrid>
    );
}
