import {memo, useCallback} from "react";
import {InputText} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type RecipeEditMashRowProps = {
    row: number;
    step: KbRecipe["mash"][number];
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function RecipeEditMashRow({ row, step, remove, update, updateScalar }: RecipeEditMashRowProps) {
    const onRemoveStep = useCallback(() => remove("mash", row), [remove, row]);
    const onChangeName = useCallback((value: string) => update(`mash[${row}].name`, value), [update, row]);
    const onChangeTempValue = useCallback((value: string) => update(`mash[${row}].temp.value`, value), [update, row]);
    const onBlurTemp = useCallback((value: string) => updateScalar(`mash[${row}].temp`, value), [updateScalar, row]);
    const onChangeTimeValue = useCallback((value: string) => update(`mash[${row}].time.value`, value), [update, row]);
    const onBlurTime = useCallback((value: string) => updateScalar(`mash[${row}].time`, value), [updateScalar, row]);
    const onChangeGrains = useCallback((value: string) => update(`mash[${row}].grains`, value), [update, row]);

    return (
        <DataGridRow
            zebra
            label="mash step details"
            expandContent={
                <DataGrid>
                    <DataGridRow zebra={false}>
                        <DataGridLabel tiny className="ml-6">Grains</DataGridLabel>
                        <DataGridInput
                            col={3}
                            value={step.grains}
                            onChange={onChangeGrains}
                        />
                    </DataGridRow>
                </DataGrid>
            }
        >
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveStep} />
                <InputText value={step.name} onChange={onChangeName} />
            </DataGridLabel>
            <DataGridInput
                col={2}
                value={step.temp.value}
                onChange={onChangeTempValue}
                onBlur={onBlurTemp}
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
export default memo(RecipeEditMashRow);
