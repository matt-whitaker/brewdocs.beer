import {memo, useCallback, useMemo} from "react";
import {AddFn, RemoveFn, ToggleFn, UpdateFn} from "@/hooks/useJsonEdit";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import equipmentCatalog from "@/data/equipment";

export type ScheduleEquipmentRowProps = {
    /** index into batch.phases */
    phase: number;
    phaseName: string;
    /** index into that phase's equipment */
    row: number;
    name: string;
    completed: boolean;
    toggle: ToggleFn;
    update: UpdateFn;
    remove: RemoveFn;
}

function ScheduleEquipmentRow({ phase, phaseName, row, name, completed, toggle, update, remove }: ScheduleEquipmentRowProps) {
    const id = `equipment-${phaseName}-${name}-${row}`;
    const equipmentOptions = useMemo(() => equipmentCatalog.map(({ name }) => ({ value: name, name })), []);

    const toggleItem = useCallback(
        () => toggle(`phases[${phase}].equipment[${row}].completed`),
        [toggle, phase, row]
    );
    const onRemove = useCallback(
        () => remove(`phases[${phase}].equipment`, row),
        [remove, phase, row]
    );
    // swapping which item this row is resets completed, same as picking a
    // different hop/grain resets its editable fields
    const onChangeName = useCallback(
        (value: string) => update(`phases[${phase}].equipment[${row}]`, { name: value, completed: false }),
        [update, phase, row]
    );

    return (
        <DataGridRow zebra>
            {/* no value column here, so the label spans the full grid */}
            <DataGridLabel htmlFor={id} className="flex items-center col-span-6 ml-6">
                <DataGridRemoveButton onClick={onRemove} />
                <DataGridCheckbox
                    id={id}
                    checked={completed}
                    onChange={toggleItem} />
                <DataGridSelect
                    data={equipmentOptions}
                    value={name}
                    onChange={onChangeName}
                />
            </DataGridLabel>
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(ScheduleEquipmentRow);
