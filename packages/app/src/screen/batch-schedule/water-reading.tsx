import {memo, useCallback, useState} from "react";
import {Scalar} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase, Milestone} from "@/model/brewable";
import {key, Ref, TrackerEntry, WaterReadings} from "@/model/tracker";
import {WATER_PARAMETERS, WaterParameterConfig} from "@/screen/batch-schedule/reading-kinds";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const refOf = (milestoneId: string): Ref => ({ on: "milestone", id: milestoneId });


type BatchScheduleWaterFieldProps = {
    milestoneId: string;
    milestoneLabel: string;
    parameter: WaterParameterConfig;
    scalar: Scalar | undefined;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
};

function BatchScheduleWaterField({ milestoneId, milestoneLabel, parameter, scalar, onPatch }: BatchScheduleWaterFieldProps) {
    const { key: param, label, unit } = parameter;

    const patch = useCallback((value: Scalar) => {
        const water: WaterReadings = { [param]: value };
        onPatch(refOf(milestoneId), { water });
    }, [onPatch, milestoneId, param]);

    const onChange = useCallback((next: string) => patch({ value: next, unit }), [patch, unit]);
    const onBlur = useCallback((next: string) => patch(scalarFromNumberWithUnit(next, unit, true)), [patch, unit]);

    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{label}</DataGridLabel>
            <DataGridInput label={`${milestoneLabel} ${label}`} cols={3} value={scalar?.value ?? ""} onChange={onChange} onBlur={onBlur} />
        </DataGridRow>
    );
}

const Field = memo(BatchScheduleWaterField);

type BatchScheduleWaterReadingItemProps = {
    phaseIndex: number;
    row: number;
    milestone: Milestone;
    entry: TrackerEntry | undefined;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    remove: RemoveFn;
};

function BatchScheduleWaterReadingItem({ phaseIndex, row, milestone, entry, onPatch, update, remove }: BatchScheduleWaterReadingItemProps) {
    const onChangeLabel = useCallback((next: string) => update(`brewable.schedule.phases[${phaseIndex}].milestones[${row}].label`, next), [update, phaseIndex, row]);
    const onRemove = useCallback(() => remove(`brewable.schedule.phases[${phaseIndex}].milestones`, row), [remove, phaseIndex, row]);

    return (
        <DataGridRow
            zebra
            label={`${milestone.label || "water sample"} parameters`}
            expandContent={(
                <DataGrid>
                    {WATER_PARAMETERS.map(parameter => (
                        <Field
                            key={parameter.key}
                            milestoneId={milestone.id}
                            milestoneLabel={milestone.label}
                            parameter={parameter}
                            scalar={entry?.water?.[parameter.key]}
                            onPatch={onPatch} />
                    ))}
                </DataGrid>
            )}
            reserveExpand
        >
            <DataGridRemoveButton label={`Remove ${milestone.label || "water sample"}`} onClick={onRemove} />
            <DataGridInput label={`${milestone.label} name`} className="ml-6" colStart={1} cols={3} value={milestone.label} onChange={onChangeLabel} />
        </DataGridRow>
    );
}

const Item = memo(BatchScheduleWaterReadingItem);

export type BatchScheduleWaterReadingProps = {
    phase: BrewablePhase;
    phaseIndex: number;
    tracker: Record<string, TrackerEntry>;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    add: AddFn;
    remove: RemoveFn;
    headerLabel: string;
    addLabel: string;
    defaultLabel: string;
};

export default function BatchScheduleWaterReading({ phase, phaseIndex, tracker, onPatch, update, add, remove, headerLabel, addLabel, defaultLabel }: BatchScheduleWaterReadingProps) {
    const [draftName, setDraftName] = useState("");

    const onAdd = useCallback(() => {
        const milestone: Milestone = { id: newId(), label: draftName.trim() || defaultLabel, kind: "water" };
        add(`brewable.schedule.phases[${phaseIndex}].milestones`, milestone);
        setDraftName("");
    }, [add, phaseIndex, defaultLabel, draftName]);

    const rows = phase.milestones
        .map((milestone, row) => ({ milestone, row }))
        .filter(({ milestone }) => milestone.kind === "water");

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible>{headerLabel}</DataGridHeaderRow>
            {rows.map(({ milestone, row }) => (
                <Item
                    key={milestone.id}
                    phaseIndex={phaseIndex}
                    row={row}
                    milestone={milestone}
                    entry={tracker[key(refOf(milestone.id))]}
                    onPatch={onPatch}
                    update={update}
                    remove={remove} />
            ))}
            <DataGridRow zebra reserveExpand>
                <DataGridAddButton label={addLabel} onClick={onAdd} />
                <DataGridInput
                    label={`${headerLabel} name to add`}
                    className="ml-6"
                    colStart={1}
                    cols={4}
                    value={draftName}
                    onChange={setDraftName}
                    placeholder={defaultLabel} />
            </DataGridRow>
        </DataGrid>
    );
}
