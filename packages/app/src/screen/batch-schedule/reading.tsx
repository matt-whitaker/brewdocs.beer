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
import DataGridSelect from "@/component/data-grid/select";
import {MutateFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import Batch from "@/model/batch";
import {BrewablePhase, Milestone, MilestoneKind} from "@/model/brewable";
import {key, Ref, TrackerEntry} from "@/model/tracker";
import {ReadingPrimary} from "@/screen/batch-schedule/reading-kinds";
import {scalarFromNumberWithUnit} from "@/utils/formatting";
import {newId} from "@/utils/id";

const refOf = (milestoneId: string): Ref => ({ on: "milestone", id: milestoneId });

type BatchScheduleReadingItemProps = {
    phaseIndex: number;
    row: number;
    milestone: Milestone;
    entry: TrackerEntry | undefined;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    remove: RemoveFn;
    unitOptions?: {name: string; value: Unit}[];
    defaultUnit?: Unit;
    /** date-only kinds (kegDate/bottleDate) skip the reading/unit inputs and use only `TrackerEntry.date` */
    dateOnly?: boolean;
};

function BatchScheduleReadingItem({ phaseIndex, row, milestone, entry, onPatch, update, remove, unitOptions, defaultUnit, dateOnly = false }: BatchScheduleReadingItemProps) {
    // reading unit defaults to the entry's own existing unit, like updateScalar's
    // prev.unit fallback — only a brand-new reading falls back to defaultUnit
    const unit = (entry?.reading?.unit ?? defaultUnit) as Unit;

    const dateValue = entry?.date?.slice(0, 10) ?? "";

    const onChangeLabel = useCallback((next: string) => update(`brewable.schedule.phases[${phaseIndex}].milestones[${row}].label`, next), [update, phaseIndex, row]);
    const onRemove = useCallback(() => remove(`brewable.schedule.phases[${phaseIndex}].milestones`, row), [remove, phaseIndex, row]);

    // the reading is a raw scalar while typing, formatted to its unit on blur —
    // mirrors the ingredient rows' updateScalar, but written to the tracker not a path
    const onChangeReading = useCallback((next: string) => onPatch(refOf(milestone.id), { reading: { value: next, unit } }), [onPatch, milestone.id, unit]);
    const onBlurReading = useCallback((next: string) => onPatch(refOf(milestone.id), { reading: scalarFromNumberWithUnit(next, unit) }), [onPatch, milestone.id, unit]);
    // switching units reformats the existing numeric value under the new one, same
    // as updateScalar's lockUnit path — an empty reading just adopts the new unit
    const onChangeUnit = useCallback((next: string) => {
        const value = entry?.reading?.value;
        onPatch(refOf(milestone.id), { reading: value ? scalarFromNumberWithUnit(value, next as Unit, true) : { value: "", unit: next as Unit } });
    }, [onPatch, milestone.id, entry?.reading?.value]);
    const onChangeDate = useCallback((next: string) => onPatch(refOf(milestone.id), { date: next }), [onPatch, milestone.id]);

    if (dateOnly) {
        return (
            <DataGridRow zebra reserveExpand>
                <DataGridRemoveButton onClick={onRemove} />
                <DataGridInput label={`${milestone.label} name`} className="ml-6" cols={3} value={milestone.label} onChange={onChangeLabel} />
                <DataGridInput label={`${milestone.label} date`} cols={3} type="date" value={dateValue} onChange={onChangeDate} />
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
                        <DataGridLabel tiny cols={3}>Reading Taken</DataGridLabel>
                        <DataGridInput label={`${milestone.label} date`} cols={3} type="date" value={dateValue} onChange={onChangeDate} />
                    </DataGridRow>
                </DataGrid>
            )}
            reserveExpand
        >
            <DataGridRemoveButton onClick={onRemove} />
            <DataGridInput label={`${milestone.label} name`} className="ml-6" cols={3} value={milestone.label} onChange={onChangeLabel} />
            <DataGridSelect cols={1} data={unitOptions ?? []} value={unit} onChange={onChangeUnit} />
            <DataGridInput label={`${milestone.label} reading`} colStart={3} value={entry?.reading?.value ?? ""} onChange={onChangeReading} onBlur={onBlurReading} />
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
export default function BatchScheduleReading({ phase, phaseIndex, tracker, onPatch, update, mutate, remove, kind, primary, unitOptions, headerLabel, addLabel, defaultLabel }: BatchScheduleReadingProps) {
    const defaultUnit = unitOptions?.[0].value;
    const dateOnly = primary === "date";

    const [draftName, setDraftName] = useState("");
    const [draftValue, setDraftValue] = useState("");

    const onAdd = useCallback(() => {
        const id = newId();
        const milestone: Milestone = { id, label: draftName.trim() || defaultLabel, kind };
        const value = draftValue.trim();
        const entry: TrackerEntry | null = !value
            ? null
            : dateOnly
                ? { date: value }
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
    }, [mutate, phaseIndex, kind, defaultLabel, draftName, draftValue, dateOnly, defaultUnit]);

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
                    unitOptions={unitOptions}
                    defaultUnit={defaultUnit}
                    dateOnly={dateOnly} />
            ))}
            <DataGridRow zebra reserveExpand>
                <DataGridAddButton label={addLabel} onClick={onAdd} />
                <DataGridInput
                    label={`${headerLabel} name to add`}
                    className="ml-6"
                    cols={3}
                    value={draftName}
                    onChange={setDraftName}
                    placeholder={defaultLabel} />
                <DataGridInput
                    label={`${headerLabel} ${dateOnly ? "date" : "value"} to add`}
                    colStart={dateOnly ? 4 : 3}
                    cols={dateOnly ? 3 : undefined}
                    type={dateOnly ? "date" : undefined}
                    value={draftValue}
                    onChange={setDraftValue} />
            </DataGridRow>
        </DataGrid>
    );
}
