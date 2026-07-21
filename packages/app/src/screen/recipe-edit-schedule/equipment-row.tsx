import {KbRecipe} from "@brewdocs.beer/kb";
import Equipment from "@/model/equipment";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import DataGridInput from "@/component/data-grid/input";
import {memo, useCallback, useEffect, useMemo, useState} from "react";
import {RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";

export type RecipeEditEquipmentRowProps = {
    row: number;
    item: KbRecipe["equipment"][number];
    remove: RemoveFn;
    update: UpdateFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
};

function RecipeEditEquipmentRow({ row, item, remove, update, equipment, equipmentIndex }: RecipeEditEquipmentRowProps) {
    const equipmentOptions = useMemo(() => equipment.map((({ name }) => ({ value: name, name }))), [equipment]);

    // free-text draft for the use[] field, committed to the array on blur —
    // rendering it straight from item.use.join(", ") would swallow a typed
    // trailing comma on every keystroke's re-render
    const [useText, setUseText] = useState(() => item.use.join(", "));
    useEffect(() => setUseText(item.use.join(", ")), [item.use]);

    const onRemoveItem = useCallback(() => remove("equipment", row), [remove, row]);
    const onChangeItem = useCallback((value: string) => {
        const catalogItem = equipmentIndex.get(value)!;
        update(`equipment[${row}]`, { name: catalogItem.name, use: catalogItem.use, count: catalogItem.count });
    }, [update, row, equipmentIndex]);
    const onBlurUse = useCallback((value: string) => update(`equipment[${row}].use`, value.split(",").map(s => s.trim()).filter(Boolean)), [update, row]);
    const onChangeCount = useCallback((value: string) => {
        const trimmed = value.trim();
        update(`equipment[${row}].count`, trimmed === "" ? undefined : Number(trimmed));
    }, [update, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveItem} />
                <DataGridSelect
                    data={equipmentOptions}
                    value={item.name}
                    onChange={onChangeItem}
                />
            </DataGridLabel>
            <DataGridInput
                col={2}
                value={useText}
                onChange={setUseText}
                onBlur={onBlurUse}
            />
            <DataGridInput
                col={3}
                value={item.count?.toString() ?? ""}
                onChange={onChangeCount}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditEquipmentRow);
