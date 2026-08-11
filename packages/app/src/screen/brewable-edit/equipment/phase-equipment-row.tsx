import {memo, useCallback, useMemo} from "react";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase} from "@/model/brewable";
import Equipment from "@/model/equipment";

export type RecipeEditPhaseEquipmentRowProps = {
    /** index into brewable.schedule.phases */
    phase: number;
    /** index into that phase's equipment */
    row: number;
    phaseLabel: string;
    item: BrewablePhase["equipment"][number];
    remove: RemoveFn;
    update: UpdateFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
};

function RecipeEditPhaseEquipmentRow({ phase, row, phaseLabel, item, remove, update, equipment, equipmentIndex }: RecipeEditPhaseEquipmentRowProps) {
    const equipmentOptions = useMemo(() => {
        const options = equipment.map((({ name }) => ({ value: name, name })));
        return equipmentIndex.has(item.name) ? options : [{ value: item.name, name: item.name }, ...options];
    }, [equipment, equipmentIndex, item.name]);
    const path = `schedule.phases[${phase}].equipment`;

    const onRemoveItem = useCallback(() => remove(path, row), [remove, path, row]);
    const onChangeItem = useCallback((value: string) => {
        const catalogItem = equipmentIndex.get(value);
        update(`${path}[${row}]`, catalogItem
            ? { name: catalogItem.name, count: catalogItem.count }
            : { name: value, count: item.count });
    }, [update, path, row, equipmentIndex, item.count]);
    const onChangeCount = useCallback((value: string) => {
        const trimmed = value.trim();
        update(`${path}[${row}].count`, trimmed === "" ? undefined : Number(trimmed));
    }, [update, path, row]);

    return (
        <DataGridRow zebra={false}>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton label={`Remove ${item.name} from ${phaseLabel}`} onClick={onRemoveItem} />
                <DataGridSelect
                    data={equipmentOptions}
                    value={item.name}
                    onChange={onChangeItem}
                />
            </DataGridLabel>
            <DataGridInput
                colStart={6}
                value={item.count?.toString() ?? ""}
                onChange={onChangeCount}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditPhaseEquipmentRow);
