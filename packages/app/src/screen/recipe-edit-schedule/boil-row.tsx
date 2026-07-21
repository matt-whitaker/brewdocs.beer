import {KbRecipe} from "@brewdocs.beer/kb";
import {InputText} from "@brewdocs.beer/design";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridInput from "@/component/data-grid/input";
import {memo, useCallback} from "react";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type RecipeEditBoilRowProps = {
    row: number;
    step: KbRecipe["boil"][number];
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function RecipeEditBoilRow({ row, step, remove, update, updateScalar }: RecipeEditBoilRowProps) {
    const onRemoveStep = useCallback(() => remove("boil", row), [remove, row]);
    const onChangeName = useCallback((value: string) => update(`boil[${row}].name`, value), [update, row]);
    const onChangeHops = useCallback((value: string) => update(`boil[${row}].hops`, value), [update, row]);
    const onChangeTimeValue = useCallback((value: string) => update(`boil[${row}].time.value`, value), [update, row]);
    const onBlurTime = useCallback((value: string) => updateScalar(`boil[${row}].time`, value), [updateScalar, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveStep} />
                <InputText value={step.name} onChange={onChangeName} />
            </DataGridLabel>
            <DataGridInput
                col={2}
                value={step.hops}
                onChange={onChangeHops}
            />
            <DataGridInput
                col={3}
                value={step.time.value}
                onChange={onChangeTimeValue}
                onBlur={onBlurTime}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditBoilRow);
