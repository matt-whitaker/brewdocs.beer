import {ScheduleItem, SchedulePhase} from "@/model/batch";
import Equipment from "@/model/equipment";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import {equipmentToScheduleItem} from "@/transform/equipmentToScheduleItem";
import {Fragment, memo, useCallback, useMemo} from "react";
import {RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";

export type PlanningEquipmentRowProps = {
    /** index into batch.phases */
    phase: number;
    schedulePhase: SchedulePhase;
    /** index into that phase's equipment */
    row: number;
    item: ScheduleItem;
    remove: RemoveFn;
    update: UpdateFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
}

function PlanningEquipmentRow({ phase, schedulePhase, row, item, remove, update, equipment, equipmentIndex }: PlanningEquipmentRowProps) {
    const equipmentOptions = useMemo(() => equipment.map((({ name }) => ({ value: name, name }))), [equipment]);

    const onRemoveItem = useCallback(() => remove(`phases[${phase}].equipment`, row), [remove, phase, row]);
    const onChangeItem = useCallback((value: string) => update(`phases[${phase}].equipment[${row}]`, equipmentToScheduleItem(equipmentIndex!.get(value)!, schedulePhase)), [update, phase, row, schedulePhase, equipmentIndex]);

    return (
        <Fragment>
            <DataGridRow zebra>
                <DataGridLabel className="ml-6" cols={4}>
                    <DataGridRemoveButton onClick={onRemoveItem} />
                    <DataGridSelect
                        data={equipmentOptions}
                        value={item.name}
                        onChange={onChangeItem}
                    />
                </DataGridLabel>
            </DataGridRow>
        </Fragment>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(PlanningEquipmentRow);
