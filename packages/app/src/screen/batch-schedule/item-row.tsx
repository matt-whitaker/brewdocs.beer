import {memo, useCallback} from "react";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridRow from "@/component/data-grid/row";
import {UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {ScheduleDetail, ScheduleItem} from "@/model/batch";
import {Ref, TrackerEntry} from "@/model/tracker";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

const refOf = (id: string): Ref => ({ on: "assignment", id });

type BatchScheduleItemDetailProps = {
    detail: ScheduleDetail;
    value: string;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    /** set only for a tracker-backed detail (no `path`) — the yeast pitch date */
    onChangeTrackerDate?: (next: string) => void;
};

/** one row of the nested grid behind a row's expander */
function BatchScheduleItemDetail({ detail, value, update, updateScalar, onChangeTrackerDate }: BatchScheduleItemDetailProps) {
    // a date is a plain string at the path, not a scalar, so it's written whole
    // — unless it's tracker-backed (no path), which writes through the tracker instead
    const onChangeDate = useCallback(
        (next: string) => (detail.path ? update(detail.path, next) : onChangeTrackerDate?.(next)),
        [update, detail.path, onChangeTrackerDate]
    );
    const onChangeValue = useCallback((next: string) => update(`${detail.path}.value`, next), [update, detail.path]);
    const onBlurValue = useCallback((next: string) => updateScalar(detail.path!, next), [updateScalar, detail.path]);

    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{detail.name}</DataGridLabel>
            {detail.input === "date" ? (
                <DataGridInput cols={3} type="date" value={value} onChange={onChangeDate} />
            ) : (
                <DataGridInput
                    colStart={3}
                    value={value}
                    onChange={onChangeValue}
                    onBlur={onBlurValue}
                />
            )}
        </DataGridRow>
    );
}

export type BatchScheduleItemRowProps = {
    item: ScheduleItem;
    /** live value at item.path, read by the screen so this stays a dumb row */
    value: string;
    /** live values for item.extra, in the same order; empty for a tracker-backed (path-less) detail */
    extraValues?: string[];
    /** this row's own tracker entry — `batch.tracker[key({on:"assignment", id: item.id})]` */
    entry: TrackerEntry | undefined;
    /** immediate checkoff toggle, mirroring the equipment list's onToggle (see index.tsx) */
    onToggle: (ref: Ref) => void;
    /** debounced tracker patch — actual amount and yeast pitch date (see index.tsx's patchTracker) */
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};

function BatchScheduleItemRow({ item, value, extraValues, entry, onToggle, onPatch, update, updateScalar }: BatchScheduleItemRowProps) {
    const id = `schedule-item-${item.tags[0]}-${item.tags[1]}-${item.name}`;

    const onToggleCompleted = useCallback(() => onToggle(refOf(item.id)), [onToggle, item.id]);

    // writes through to the ingredient itself — item.path, never a copy on the item
    const onChangeValue = useCallback((next: string) => update(`${item.path}.value`, next), [update, item.path]);
    const onBlurValue = useCallback((next: string) => updateScalar(item.path, next), [updateScalar, item.path]);

    // `actual` may not exist yet, so write the whole scalar and carry the planned
    // amount's unit across — updateScalar needs a unit to fall back on when the
    // user types a bare number
    const onChangeAmount = useCallback(
        (next: string) => onPatch(refOf(item.id), { actual: { value: next, unit: item.amount?.unit } }),
        [onPatch, item.id, item.amount?.unit]
    );
    // focus-then-blur without typing leaves `actual` unset, and there'd be no
    // unit on the tracker entry yet — fall back to the planned amount's unit
    const onBlurAmount = useCallback((next: string) => {
        if (entry?.actual && item.amount?.unit) {
            onPatch(refOf(item.id), { actual: scalarFromNumberWithUnit(next, item.amount.unit) });
        }
    }, [onPatch, item.id, entry?.actual, item.amount?.unit]);

    // the yeast row's pitch date lives on this same assignment's tracker entry, not a dot-path
    const onChangePitchDate = useCallback((next: string) => onPatch(refOf(item.id), { date: next }), [onPatch, item.id]);

    const planned = item.amount?.value;
    const actual = entry?.actual;
    const used = actual?.value ?? planned ?? "";
    // once what went in differs from the plan, show the plan alongside it
    const drifted = !!actual && !!planned && actual.value !== planned;
    const note = [item.note, drifted ? `plan ${planned}` : null].filter(Boolean).join(" · ");
    const completed = entry?.completed ?? false;

    return (
        <DataGridRow
            zebra
            label={`${item.name} details`}
            expandContent={item.extra?.length ? (
                <DataGrid>
                    {item.extra.map((detail, i) => (
                        <BatchScheduleItemDetail
                            key={detail.name}
                            detail={detail}
                            value={detail.path ? extraValues?.[i] ?? "" : entry?.date ?? ""}
                            update={update}
                            updateScalar={updateScalar}
                            onChangeTrackerDate={detail.path ? undefined : onChangePitchDate} />
                    ))}
                </DataGrid>
            ) : undefined}
            reserveExpand
        >
            <DataGridLabel className="flex items-center" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={completed}
                    onChange={onToggleCompleted} />
                {item.name}
                {note ? <DataGridLabelNote>({note})</DataGridLabelNote> : null}
            </DataGridLabel>
            {item.amount ? (
                <DataGridInput
                    colStart={2}
                    value={used}
                    onChange={onChangeAmount}
                    onBlur={onBlurAmount}
                />
            ) : null}
            {/* mash grains carry no write-through value (empty path) — checklist only, no third column */}
            {item.path ? (
                <DataGridInput
                    colStart={3}
                    value={value}
                    onChange={onChangeValue}
                    onBlur={onBlurValue}
                />
            ) : null}
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched tracker/brewable
// branches by reference, editors are stable), so editing one row doesn't
// re-render its siblings
export default memo(BatchScheduleItemRow);
