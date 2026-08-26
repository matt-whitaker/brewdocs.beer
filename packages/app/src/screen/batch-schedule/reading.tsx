import {memo, useCallback, useState} from "react";
import {Unit} from "@brewdocs.beer/core";
import {putEntry} from "@/actions/tracker";
import DataGrid from "@/component/data-grid";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import {MutateFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {BrewablePhase, Milestone, MilestoneKind} from "@/model/brewable";
import {key, Ref, TrackerEntry} from "@/model/tracker";
import {ReadingPrimary} from "@/screen/batch-schedule/reading-kinds";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const refOf = (milestoneId: string): Ref => ({ on: "milestone", id: milestoneId });

/**
 * A milestone's `TrackerEntry.date` is one string carrying an optional time, so
 * the two native inputs that edit it split and recombine it here. `<input
 * type="date">` reads `YYYY-MM-DD` and `<input type="time">` reads `HH:mm`,
 * which are exactly the leading slices of an ISO timestamp — a quick-logged
 * full-ISO entry therefore round-trips through both fields.
 *
 * A time with no date is dropped rather than written as a bare `T09:30`: that
 * parses as nothing, so it would show blank in both fields and drop the
 * milestone off the brew timer.
 */
const datePartOf = (value: string | undefined) => value?.slice(0, 10) ?? "";
const timePartOf = (value: string | undefined) => value?.slice(11, 16) ?? "";
const combineDateTime = (date: string, time: string) => date && time ? `${date}T${time}` : date;

type BatchScheduleReadingItemProps = {
    phaseIndex: number;
    row: number;
    milestone: Milestone;
    entry: TrackerEntry | undefined;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    remove: RemoveFn;
    defaultUnit?: Unit;
    valuePlaceholder?: string;

    dateOnly?: boolean;
};

function BatchScheduleReadingItem({ phaseIndex, row, milestone, entry, onPatch, update, remove, defaultUnit, valuePlaceholder, dateOnly = false }: BatchScheduleReadingItemProps) {
    const unit = (entry?.reading?.unit ?? defaultUnit) as Unit;

    const dateValue = datePartOf(entry?.date);
    const timeValue = timePartOf(entry?.date);
    const removeLabel = `Remove ${milestone.label || "reading"}`;

    const onChangeLabel = useCallback((next: string) => update(`brewable.schedule.phases[${phaseIndex}].milestones[${row}].label`, next), [update, phaseIndex, row]);
    const onRemove = useCallback(() => remove(`brewable.schedule.phases[${phaseIndex}].milestones`, row), [remove, phaseIndex, row]);

    const onChangeReading = useCallback((next: string) => onPatch(refOf(milestone.id), { reading: { value: next, unit } }), [onPatch, milestone.id, unit]);
    const onBlurReading = useCallback((next: string) => onPatch(refOf(milestone.id), { reading: scalarFromNumberWithUnit(next, unit) }), [onPatch, milestone.id, unit]);
    const onChangeDate = useCallback((next: string) => onPatch(refOf(milestone.id), { date: combineDateTime(next, timeValue) }), [onPatch, milestone.id, timeValue]);
    const onChangeTime = useCallback((next: string) => onPatch(refOf(milestone.id), { date: combineDateTime(dateValue, next) }), [onPatch, milestone.id, dateValue]);

    if (dateOnly) {
        return (
            <DataGridRow zebra reserveExpand>
                <DataGridRemoveButton label={removeLabel} onClick={onRemove} />
                <DataGridInput label={`${milestone.label} name`} className="ml-6" colStart={1} cols={3} value={milestone.label} onChange={onChangeLabel} />
                <DataGridInput label={`${milestone.label} date`} colStart={5} cols={1} type="date" value={dateValue} onChange={onChangeDate} />
                <DataGridInput label={`${milestone.label} time`} colStart={6} cols={1} type="time" value={timeValue} onChange={onChangeTime} />
            </DataGridRow>
        );
    }

    return (
        <DataGridRow
            zebra
            label={`${milestone.label || "reading"} details`}
            expandContent={(
                <DataGrid>
                    <DataGridRow zebra={false}>
                        <DataGridLabel tiny cols={2}>Reading Taken</DataGridLabel>
                        <DataGridInput label={`${milestone.label} date`} colStart={3} cols={2} type="date" value={dateValue} onChange={onChangeDate} />
                        <DataGridInput label={`${milestone.label} time`} colStart={5} cols={2} type="time" value={timeValue} onChange={onChangeTime} />
                    </DataGridRow>
                </DataGrid>
            )}
            reserveExpand
        >
            <DataGridRemoveButton label={removeLabel} onClick={onRemove} />
            <DataGridInput label={`${milestone.label} name`} className="ml-6" colStart={1} cols={3} value={milestone.label} onChange={onChangeLabel} />
            <DataGridInput label={`${milestone.label} reading`} colStart={6} cols={1} value={entry?.reading?.value ?? ""} placeholder={valuePlaceholder} onChange={onChangeReading} onBlur={onBlurReading} />
        </DataGridRow>
    );
}

// props are primitives plus a stable onPatch/update/remove, so editing one
// reading doesn't re-render the rest — same reasoning as the equipment list
const Item = memo(BatchScheduleReadingItem);

export type BatchScheduleReadingProps = {
    phase: BrewablePhase;
    phaseIndex: number;
    tracker: Record<string, TrackerEntry>;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    mutate: MutateFn<Batch>;
    remove: RemoveFn;
    kind: MilestoneKind;
    primary: ReadingPrimary;
    unitOptions?: {name: string; value: Unit}[];
    valuePlaceholder?: string;
    headerLabel: string;
    addLabel: string;
    defaultLabel: string;
};

/**
 * Editable readings for a phase, one row per `phase.milestones[]` entry of
 * `kind`, each keyed to a `{on:"milestone", id}` entry in `batch.tracker`.
 * Its own DataGrid so the collapse rule scopes to these rows, like Equipment.
 * Renders on every phase tab, including an empty one — the brewer adds the
 * first reading from here.
 */
export default function BatchScheduleReading({ phase, phaseIndex, tracker, onPatch, update, mutate, remove, kind, primary, unitOptions, valuePlaceholder, headerLabel, addLabel, defaultLabel }: BatchScheduleReadingProps) {
    const defaultUnit = unitOptions?.[0].value;
    const dateOnly = primary === "date";

    const [draftName, setDraftName] = useState("");
    const [draftValue, setDraftValue] = useState("");
    const [draftTime, setDraftTime] = useState("");

    const onAdd = useCallback(() => {
        const id = newId();
        const milestone: Milestone = { id, label: draftName.trim() || defaultLabel, kind };
        const value = draftValue.trim();
        const entry: TrackerEntry | null = !value
            ? null
            : dateOnly
                ? { date: combineDateTime(value, draftTime.trim()) }
                : { reading: scalarFromNumberWithUnit(value, defaultUnit as Unit) };

        mutate(draft => {
            const phases = draft.brewable.schedule.phases.map((candidate, i) =>
                i === phaseIndex ? { ...candidate, milestones: [...candidate.milestones, milestone] } : candidate);

            return {
                ...draft,
                brewable: { ...draft.brewable, schedule: { ...draft.brewable.schedule, phases } },
                tracker: entry ? putEntry(draft.tracker, refOf(id), entry) : draft.tracker
            };
        }, true);

        setDraftName("");
        setDraftValue("");
        setDraftTime("");
    }, [mutate, phaseIndex, kind, defaultLabel, draftName, draftValue, draftTime, dateOnly, defaultUnit]);

    const rows = phase.milestones
        .map((milestone, row) => ({ milestone, row }))
        .filter(({ milestone }) => milestone.kind === kind);

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
                    remove={remove}
                    defaultUnit={defaultUnit}
                    valuePlaceholder={valuePlaceholder}
                    dateOnly={dateOnly} />
            ))}
            <DataGridRow zebra reserveExpand>
                <DataGridAddButton label={addLabel} onClick={onAdd} />
                <DataGridInput
                    label={`${headerLabel} name to add`}
                    className="ml-6"
                    colStart={1}
                    cols={3}
                    value={draftName}
                    onChange={setDraftName}
                    placeholder={defaultLabel} />
                <DataGridInput
                    label={`${headerLabel} ${dateOnly ? "date" : "value"} to add`}
                    colStart={dateOnly ? 5 : 6}
                    cols={1}
                    type={dateOnly ? "date" : undefined}
                    value={draftValue}
                    placeholder={dateOnly ? undefined : valuePlaceholder}
                    onChange={setDraftValue} />
                {dateOnly && (
                    <DataGridInput
                        label={`${headerLabel} time to add`}
                        colStart={6}
                        cols={1}
                        type="time"
                        value={draftTime}
                        onChange={setDraftTime} />
                )}
            </DataGridRow>
        </DataGrid>
    );
}
