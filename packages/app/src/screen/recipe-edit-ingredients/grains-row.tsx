import {memo, useCallback, useMemo} from "react";
import {UNITS} from "@brewdocs.beer/core";
import {KbGrain} from "@brewdocs.beer/kb";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import Grain from "@/model/grain";

export type RecipeGrain = Grain;

/** Default weight for a grain newly picked from the catalog. */
export function kbGrainToRecipeGrain(kbGrain: KbGrain): RecipeGrain {
    return {
        name: kbGrain.name,
        weight: {
            value: "0.0lb",
            unit: UNITS.POUNDS
        },
    };
}

export type RecipeEditGrainsRowProps = {
    row: number;
    grain: RecipeGrain;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbGrains: KbGrain[];
    kbGrainsIndex: Map<string, KbGrain>;
};

function RecipeEditGrainsRow({ row, grain, remove, update, updateScalar, kbGrains, kbGrainsIndex }: RecipeEditGrainsRowProps) {
    const grainOptions = useMemo(() => kbGrains.map((({ name }) => ({ value: name, name }))), [kbGrains]);

    const onRemoveGrain = useCallback(() => remove("grains", row), [remove, row]);
    const onChangeGrain = useCallback((value: string) => update(`grains[${row}]`, kbGrainToRecipeGrain(kbGrainsIndex!.get(value)!)), [update, row, kbGrainsIndex]);
    const onChangeWeightValue = useCallback((value: string) => update(`grains[${row}].weight.value`, value), [update, row]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`grains[${row}].weight`, value), [updateScalar, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveGrain} />
                <DataGridSelect
                    data={grainOptions}
                    value={grain.name}
                    onChange={onChangeGrain}
                />
            </DataGridLabel>
            <DataGridInput
                col={3}
                value={grain.weight.value}
                onChange={onChangeWeightValue}
                onBlur={onBlurWeight}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditGrainsRow);
