import {memo, useCallback} from "react";
import {InputText} from "@brewdocs.beer/design";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Additive from "@/model/additive";

export type RecipeAdditive = Additive;

export type RecipeEditAdditivesRowProps = {
    row: number;
    additive: RecipeAdditive;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function RecipeEditAdditivesRow({ row, additive, remove, update, updateScalar }: RecipeEditAdditivesRowProps) {
    const onRemoveAdditive = useCallback(() => remove("additives", row), [remove, row]);
    const onChangeName = useCallback((value: string) => update(`additives[${row}].name`, value), [update, row]);
    const onChangeBoilValue = useCallback((value: string) => update(`additives[${row}].boil.value`, value), [update, row]);
    const onBlurBoil = useCallback((value: string) => updateScalar(`additives[${row}].boil`, value), [updateScalar, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveAdditive} />
                <InputText
                    value={additive.name}
                    onChange={onChangeName}
                />
            </DataGridLabel>
            <DataGridInput
                colStart={3}
                value={additive.boil.value}
                onChange={onChangeBoilValue}
                onBlur={onBlurBoil}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditAdditivesRow);
