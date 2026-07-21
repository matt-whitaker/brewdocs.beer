import {KbHop, KbRecipe} from "../../../../kb";
import {Units} from "../../../../core";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridSelect from "@/component/data-grid/select";
import DataGridInput from "@/component/data-grid/input";
import {memo, useCallback, useMemo} from "react";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";

export type RecipeHop = KbRecipe["hops"][number];

/** the only phases a hop addition can land in — mirrors the app Hop model's phase union */
export const HOP_PHASE_OPTIONS = [
    { value: "boil", name: "Boil" },
    { value: "secondary", name: "Secondary" },
    { value: "dry", name: "Dry Hop" },
];

/** Default weight/boil/phase for a hop newly picked from the catalog; alpha carries the catalog's value. */
export function kbHopToRecipeHop(kbHop: KbHop): RecipeHop {
    return {
        name: kbHop.name,
        weight: {
            value: "0.0oz",
            unit: Units.OUNCES
        },
        alpha: {
            value: `${kbHop.alpha}%`,
            unit: Units.PERCENT
        },
        boil: {
            value: "60min",
            unit: Units.MINUTES
        },
        phase: "boil"
    };
}

export type RecipeEditHopsRowProps = {
    row: number;
    hop: RecipeHop;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    kbHops: KbHop[];
    kbHopsIndex: Map<string, KbHop>;
}

function RecipeEditHopsRow({ row, hop, remove, update, updateScalar, kbHops, kbHopsIndex }: RecipeEditHopsRowProps) {
    const hopOptions = useMemo(() => kbHops.map((({ name }) => ({ value: name, name }))), [kbHops]);

    const onRemoveHop = useCallback(() => remove("hops", row), [remove, row]);
    const onChangeHop = useCallback((value: string) => update(`hops[${row}]`, kbHopToRecipeHop(kbHopsIndex!.get(value)!)), [update, row, kbHopsIndex]);
    const onChangeWeightValue = useCallback((value: string) => update(`hops[${row}].weight.value`, value), [update, row]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`hops[${row}].weight`, value), [updateScalar, row]);
    const onChangeBoilValue = useCallback((value: string) => update(`hops[${row}].boil.value`, value), [update, row]);
    const onBlurBoil = useCallback((value: string) => updateScalar(`hops[${row}].boil`, value), [updateScalar, row]);
    const onChangeAlphaValue = useCallback((value: string) => update(`hops[${row}].alpha.value`, value), [update, row]);
    const onBlurAlpha = useCallback((value: string) => updateScalar(`hops[${row}].alpha`, value), [updateScalar, row]);
    const onChangePhase = useCallback((value: string) => update(`hops[${row}].phase`, value), [update, row]);

    return (
        <DataGridRow
            zebra
            label="hop details"
            expandContent={
                <DataGrid>
                    <DataGridRow>
                        <DataGridLabel tiny className="ml-6">Alpha %</DataGridLabel>
                        <DataGridInput
                            col={3}
                            value={hop.alpha.value}
                            onChange={onChangeAlphaValue}
                            onBlur={onBlurAlpha}
                        />
                    </DataGridRow>
                    <DataGridRow>
                        <DataGridLabel tiny className="ml-6">Phase</DataGridLabel>
                        <DataGridSelect
                            cols={2}
                            className="col-start-5"
                            data={HOP_PHASE_OPTIONS}
                            value={hop.phase}
                            onChange={onChangePhase}
                        />
                    </DataGridRow>
                </DataGrid>
            }
        >
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton onClick={onRemoveHop} />
                <DataGridSelect
                    data={hopOptions}
                    value={hop.name}
                    onChange={onChangeHop}
                />
            </DataGridLabel>
            <DataGridInput
                col={2}
                value={hop.weight.value}
                onChange={onChangeWeightValue}
                onBlur={onBlurWeight}
            />
            <DataGridInput
                col={3}
                value={hop.boil.value}
                onChange={onChangeBoilValue}
                onBlur={onBlurBoil}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditHopsRow);
