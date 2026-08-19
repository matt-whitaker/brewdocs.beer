import {memo, useCallback} from "react";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {RemoveFn, ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {ShoppingItem} from "@/model/batch";

export type BatchShoppingItemRowProps = {
    /** index into batch.shopping — display order is sorted, so this is the real position */
    row: number;
    item: ShoppingItem;
    toggle: ToggleFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    remove: RemoveFn;
};

function BatchShoppingItemRow({ row, item, toggle, update, updateScalar, remove }: BatchShoppingItemRowProps) {
    const id = `shopping-item-${item.tags[0]}-${item.name}`;

    const onTogglePurchased = useCallback(() => toggle(`shopping[${row}].purchased`), [toggle, row]);
    const onChangeCostValue = useCallback((value: string) => update(`shopping[${row}].cost.value`, value), [update, row]);
    const onBlurCost = useCallback((value: string) => updateScalar(`shopping[${row}].cost`, value, true), [updateScalar, row]);
    const onRemove = useCallback(() => remove("shopping", row), [remove, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="flex items-center" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={item.purchased}
                    onChange={onTogglePurchased} />
                {item.name}{item.scalar ? ` - ${item.scalar.value}` : ""}
            </DataGridLabel>
            {item.source === "user" && (
                <div className="col-start-5 flex items-center justify-end">
                    <DataGridRemoveButton label={`Remove ${item.name}`} onClick={onRemove} />
                </div>
            )}
            <DataGridInput
                colStart={6}
                label={`${item.name} cost`}
                value={item.cost.value}
                onChange={onChangeCostValue}
                onBlur={onBlurCost}
            />
        </DataGridRow>
    );
}

export default memo(BatchShoppingItemRow);
