import {memo, useCallback, useEffect, useMemo, useState} from "react";
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
    item: BrewablePhase["equipment"][number];
    remove: RemoveFn;
    update: UpdateFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
};

function RecipeEditPhaseEquipmentRow({ phase, row, item, remove, update, equipment, equipmentIndex }: RecipeEditPhaseEquipmentRowProps) {
    const equipmentOptions = useMemo(() => {
        const options = equipment.map((({ name }) => ({ value: name, name })));
        return equipmentIndex.has(item.name) ? options : [{ value: item.name, name: item.name }, ...options];
    }, [equipment, equipmentIndex, item.name]);
    const path = `schedule.phases[${phase}].equipment`;

    // free-text draft for the use[] field, committed to the array on blur —
    // rendering it straight from item.use.join(", ") would swallow a typed
    // trailing comma on every keystroke's re-render
    const [useText, setUseText] = useState(() => item.use.join(", "));
    useEffect(() => setUseText(item.use.join(", ")), [item.use]);

    const onRemoveItem = useCallback(() => remove(path, row), [remove, path, row]);
    const onChangeItem = useCallback((value: string) => {
        const catalogItem = equipmentIndex.get(value);
        update(`${path}[${row}]`, catalogItem
            ? { name: catalogItem.name, use: catalogItem.use, count: catalogItem.count }
            : { name: value, use: item.use, count: item.count });
    }, [update, path, row, equipmentIndex, item.use, item.count]);
    const onBlurUse = useCallback((value: string) => update(`${path}[${row}].use`, value.split(",").map(s => s.trim()).filter(Boolean)), [update, path, row]);
    const onChangeCount = useCallback((value: string) => {
        const trimmed = value.trim();
        update(`${path}[${row}].count`, trimmed === "" ? undefined : Number(trimmed));
    }, [update, path, row]);

    return (
        <DataGridRow zebra={false}>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveItem} />
                <DataGridSelect
                    data={equipmentOptions}
                    value={item.name}
                    onChange={onChangeItem}
                />
            </DataGridLabel>
            <DataGridInput
                colStart={2}
                value={useText}
                onChange={setUseText}
                onBlur={onBlurUse}
            />
            <DataGridInput
                colStart={3}
                value={item.count?.toString() ?? ""}
                onChange={onChangeCount}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditPhaseEquipmentRow);
