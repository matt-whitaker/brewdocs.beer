import {memo, useCallback} from "react";
import {Unit} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRemoveButton from "@/component/data-grid/remove-button";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import {BrewablePhase, Milestone, MilestoneKind} from "@/model/brewable";
import {key, Ref, TrackerEntry} from "@/model/tracker";
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
    const removeLabel = `Remove ${milestone.label || "reading"}`;

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
                <DataGridRemoveButton label={removeLabel} onClick={onRemove} />
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
            <DataGridRemoveButton label={removeLabel} onClick={onRemove} />
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
    add: AddFn;
    remove: RemoveFn;
    kind: MilestoneKind;
    unitOptions?: {name: string; value: Unit}[];
    headerLabel: string;
    addLabel: string;
    defaultLabel: string;
    /** date-only kinds (kegDate/bottleDate) skip the reading/unit inputs and use only `TrackerEntry.date` */
    dateOnly?: boolean;
};

/**
 * Editable readings for a phase, one row per `phase.milestones[]` entry of
 * `kind`, each keyed to a `{on:"milestone", id}` entry in `batch.tracker`.
 * Its own DataGrid so the collapse rule scopes to these rows, like Equipment.
 * Renders on every phase tab, including an empty one — the brewer adds the
 * first reading from here.
 */
export default function BatchScheduleReading({ phase, phaseIndex, tracker, onPatch, update, add, remove, kind, unitOptions, headerLabel, addLabel, defaultLabel, dateOnly = false }: BatchScheduleReadingProps) {
    const defaultUnit = unitOptions?.[0].value;

    const onAdd = useCallback(() => {
        const milestone: Milestone = { id: newId(), label: defaultLabel, kind };
        add(`brewable.schedule.phases[${phaseIndex}].milestones`, milestone);
    }, [add, phaseIndex, kind, defaultLabel]);

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
                <DataGridLabel className="ml-6" cols={4}>{addLabel}</DataGridLabel>
            </DataGridRow>
        </DataGrid>
    );
}
