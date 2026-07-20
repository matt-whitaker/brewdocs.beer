import {memo, useCallback} from "react";
import {ShoppingItem} from "@/model/batch";
import {ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import DataGridCheckbox from "@/component/data-grid/checkbox";

export type ShoppingItemRowProps = {
    /** index into batch.shopping — display order is sorted, so this is the real position */
    row: number;
    item: ShoppingItem;
    toggle: ToggleFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}

function ShoppingItemRow({ row, item, toggle, update, updateScalar }: ShoppingItemRowProps) {
    const id = `shopping-item-${item.tags[0]}-${item.name}`;

    const onTogglePurchased = useCallback(() => toggle(`shopping[${row}].purchased`), [toggle, row]);
    const onChangeCostValue = useCallback((value: string) => update(`shopping[${row}].cost.value`, value), [update, row]);
    const onBlurCost = useCallback((value: string) => updateScalar(`shopping[${row}].cost`, value, true), [updateScalar, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="flex items-center" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={item.purchased}
                    onChange={onTogglePurchased} />
                {item.name}{item.scalar ? ` - ${item.scalar.value}` : ""}
            </DataGridLabel>
            <DataGridInput
                col={3}
                value={item.cost.value}
                onChange={onChangeCostValue}
                onBlur={onBlurCost}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(ShoppingItemRow);
