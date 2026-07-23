import {memo, useCallback} from "react";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {ShoppingItem} from "@/model/batch";

export type BatchShoppingItemRowProps = {
    /** index into batch.shopping — display order is sorted, so this is the real position */
    row: number;
    item: ShoppingItem;
    toggle: ToggleFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function BatchShoppingItemRow({ row, item, toggle, update, updateScalar }: BatchShoppingItemRowProps) {
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
                colStart={3}
                value={item.cost.value}
                onChange={onChangeCostValue}
                onBlur={onBlurCost}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(BatchShoppingItemRow);
