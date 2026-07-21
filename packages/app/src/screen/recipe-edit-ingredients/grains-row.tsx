import {KbGrain, KbRecipe} from "../../../../kb";
import {Units} from "../../../../core";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import DataGridInput from "@/component/data-grid/input";
import {memo, useCallback, useMemo} from "react";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type RecipeGrain = KbRecipe["grains"][number];

/** Default weight for a grain newly picked from the catalog. */
export function kbGrainToRecipeGrain(kbGrain: KbGrain): RecipeGrain {
    return {
        name: kbGrain.name,
        weight: {
            value: "0.0lb",
            unit: Units.POUNDS
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
