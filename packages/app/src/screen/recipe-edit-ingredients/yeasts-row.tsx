import {KbYeast, KbRecipe} from "../../../../kb";
import {Units} from "../../../../core";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import DataGridInput from "@/component/data-grid/input";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import {memo, useCallback, useMemo} from "react";
import {RemoveFn, ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type RecipeYeast = KbRecipe["yeasts"][number];

/** Default attenuation/temp for a yeast newly picked from the catalog. */
export function kbYeastToRecipeYeast(kbYeast: KbYeast): RecipeYeast {
    return {
        name: kbYeast.name,
        avg_attn: {
            value: "70%",
            unit: Units.PERCENT
        },
        temp: {
            value: "0°F",
            unit: Units.FAHRENHEIT
        },
        starter: false
    };
}

export type RecipeEditYeastsRowProps = {
    row: number;
    yeast: RecipeYeast;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    toggle: ToggleFn;
    kbYeasts: KbYeast[];
    kbYeastsIndex: Map<string, KbYeast>;
}

function RecipeEditYeastsRow({ row, yeast, remove, update, updateScalar, toggle, kbYeasts, kbYeastsIndex }: RecipeEditYeastsRowProps) {
    const yeastOptions = useMemo(() => kbYeasts.map((({ name }) => ({ value: name, name }))), [kbYeasts]);
    const starterId = `yeast-${row}-starter`;

    const onRemoveYeast = useCallback(() => remove("yeasts", row), [remove, row]);
    const onChangeYeast = useCallback((value: string) => update(`yeasts[${row}]`, kbYeastToRecipeYeast(kbYeastsIndex!.get(value)!)), [update, row, kbYeastsIndex]);
    const onChangeTempValue = useCallback((value: string) => update(`yeasts[${row}].temp.value`, value), [update, row]);
    const onBlurTemp = useCallback((value: string) => updateScalar(`yeasts[${row}].temp`, value), [updateScalar, row]);
    const onToggleStarter = useCallback(() => toggle(`yeasts[${row}].starter`), [toggle, row]);

    return (
        <DataGridRow zebra>
            <DataGridLabel className="ml-6" cols={3}>
                <DataGridRemoveButton onClick={onRemoveYeast} />
                <DataGridSelect
                    data={yeastOptions}
                    value={yeast.name}
                    onChange={onChangeYeast}
                />
            </DataGridLabel>
            <DataGridLabel className="flex items-center" cols={2} htmlFor={starterId}>
                <DataGridCheckbox
                    id={starterId}
                    checked={yeast.starter}
                    onChange={onToggleStarter} />
                Starter
            </DataGridLabel>
            <DataGridInput
                col={3}
                value={yeast.temp.value}
                onChange={onChangeTempValue}
                onBlur={onBlurTemp}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditYeastsRow);
