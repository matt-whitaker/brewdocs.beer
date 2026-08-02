import {memo, ReactNode, useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {Assignment, assignmentResourceName} from "@/model/brewable";

export type RecipeEditAssignmentRowProps = {
    row: number;
    assignment: Assignment;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

/**
 * One row per assignment: name + remove, a headline scalar when the
 * resource has one (grain/hop `weight`), and an expansion narrowed by
 * `resourceType` for everything else (switching on it to reach
 * `assignment.resource`'s type-specific fields with no cast). `row` indexes
 * `assignments` directly (dot-paths are relative to the brewable), so every
 * dot-path below is `assignments[${row}].resource.<field>`.
 */
function RecipeEditAssignmentRow({ row, assignment, remove, update, updateScalar }: RecipeEditAssignmentRowProps) {
    const base = `assignments[${row}].resource`;

    const onRemove = useCallback(() => remove("assignments", row), [remove, row]);

    const onChangeWeightValue = useCallback((value: string) => update(`${base}.weight.value`, value), [update, base]);
    const onBlurWeight = useCallback((value: string) => updateScalar(`${base}.weight`, value), [updateScalar, base]);

    const onChangeAlphaValue = useCallback((value: string) => update(`${base}.alpha.value`, value), [update, base]);
    const onBlurAlpha = useCallback((value: string) => updateScalar(`${base}.alpha`, value), [updateScalar, base]);
    const onChangeBoilValue = useCallback((value: string) => update(`${base}.boil.value`, value), [update, base]);
    const onBlurBoil = useCallback((value: string) => updateScalar(`${base}.boil`, value), [updateScalar, base]);

    const onChangeAttnValue = useCallback((value: string) => update(`${base}.avg_attn.value`, value), [update, base]);
    const onBlurAttn = useCallback((value: string) => updateScalar(`${base}.avg_attn`, value), [updateScalar, base]);
    const onChangeTempValue = useCallback((value: string) => update(`${base}.temp.value`, value), [update, base]);
    const onBlurTemp = useCallback((value: string) => updateScalar(`${base}.temp`, value), [updateScalar, base]);
    const onToggleStarter = useCallback(() => {
        if (assignment.resourceType !== "yeast") return;
        update(`${base}.starter`, !assignment.resource.starter);
    }, [update, base, assignment]);

    const headline = useMemo<ReactNode>(() => {
        switch (assignment.resourceType) {
            case "grain":
            case "hop":
                return (
                    <DataGridInput
                        colStart={3}
                        value={assignment.resource.weight.value}
                        onChange={onChangeWeightValue}
                        onBlur={onBlurWeight}
                    />
                );
            case "yeast":
            case "additive":
                return null;
        }
    }, [assignment, onChangeWeightValue, onBlurWeight]);

    const expandContent = useMemo<ReactNode>(() => {
        switch (assignment.resourceType) {
            case "hop":
                return (
                    <DataGrid>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Alpha %</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={assignment.resource.alpha.value}
                                onChange={onChangeAlphaValue}
                                onBlur={onBlurAlpha}
                            />
                        </DataGridRow>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Boil</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={assignment.resource.boil.value}
                                onChange={onChangeBoilValue}
                                onBlur={onBlurBoil}
                            />
                        </DataGridRow>
                    </DataGrid>
                );
            case "yeast": {
                const starterId = `assignment-${row}-starter`;
                return (
                    <DataGrid>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Attenuation %</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={assignment.resource.avg_attn.value}
                                onChange={onChangeAttnValue}
                                onBlur={onBlurAttn}
                            />
                        </DataGridRow>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Temp</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={assignment.resource.temp.value}
                                onChange={onChangeTempValue}
                                onBlur={onBlurTemp}
                            />
                        </DataGridRow>
                        <DataGridRow>
                            <DataGridLabel tiny className="flex items-center ml-6" htmlFor={starterId}>
                                <DataGridCheckbox id={starterId} checked={assignment.resource.starter} onChange={onToggleStarter} />
                                Starter
                            </DataGridLabel>
                        </DataGridRow>
                    </DataGrid>
                );
            }
            case "additive": {
                const {weight} = assignment.resource;
                return weight ? (
                    <DataGrid>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Weight</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={weight.value}
                                onChange={onChangeWeightValue}
                                onBlur={onBlurWeight}
                            />
                        </DataGridRow>
                    </DataGrid>
                ) : (
                    <DataGrid>
                        <DataGridRow>
                            <DataGridLabel tiny className="ml-6">Boil</DataGridLabel>
                            <DataGridInput
                                colStart={3}
                                value={assignment.resource.boil?.value ?? ""}
                                onChange={onChangeBoilValue}
                                onBlur={onBlurBoil}
                            />
                        </DataGridRow>
                    </DataGrid>
                );
            }
            case "grain":
                return undefined;
        }
    }, [assignment, row, onChangeAlphaValue, onBlurAlpha, onChangeBoilValue, onBlurBoil, onChangeWeightValue, onBlurWeight, onChangeAttnValue, onBlurAttn, onChangeTempValue, onBlurTemp, onToggleStarter]);

    return (
        <DataGridRow zebra label="assignment details" expandContent={expandContent}>
            <DataGridLabel className="ml-6">
                <DataGridRemoveButton label={`Remove ${assignmentResourceName(assignment)}`} onClick={onRemove} />
                {assignmentResourceName(assignment)}
            </DataGridLabel>
            {headline}
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(RecipeEditAssignmentRow);
