import {memo, useCallback} from "react";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridRow from "@/component/data-grid/row";
import {ScheduleDetail, ScheduleItem} from "@/model/batch";
import {Ref, TrackerEntry} from "@/model/tracker";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

const refOf = (id: string): Ref => ({ on: "assignment", id });

type BatchScheduleItemDetailProps = {
    detail: ScheduleDetail;
    value: string;
    onChange: (next: string) => void;
};

/** one row of the nested grid behind a row's expander — brew-day facts, all tracker-backed */
function BatchScheduleItemDetail({ detail, value, onChange }: BatchScheduleItemDetailProps) {
    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{detail.name}</DataGridLabel>
            <DataGridInput cols={3} type={detail.input === "date" ? "date" : undefined} value={value} onChange={onChange} />
        </DataGridRow>
    );
}

export type BatchScheduleItemRowProps = {
    item: ScheduleItem;
    /** this row's own tracker entry — `batch.tracker[key({on:"assignment", id: item.id})]` */
    entry: TrackerEntry | undefined;
    /** immediate checkoff toggle, mirroring the equipment list's onToggle (see index.tsx) */
    onToggle: (ref: Ref) => void;
    /** debounced tracker patch — every editable value on this row (see index.tsx's patchTracker) */
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
};

function BatchScheduleItemRow({ item, entry, onToggle, onPatch }: BatchScheduleItemRowProps) {
    const id = `schedule-item-${item.id}`;

    const onToggleCompleted = useCallback(() => onToggle(refOf(item.id)), [onToggle, item.id]);

    // ⚠️ Records what actually happened; it does NOT write back over the plan.
    // Editing `brewable.assignments[i].resource.boil` from the brew-day screen
    // would overwrite the recipe-derived plan and lose what you meant to do —
    // that's Planning's job. Same shape as the amount handlers below.
    const onChangeDetail = useCallback(
        (next: string) => onPatch(refOf(item.id), { actualDetail: { value: next, unit: item.detail?.unit } }),
        [onPatch, item.id, item.detail?.unit]
    );
    const onBlurDetail = useCallback((next: string) => {
        if (entry?.actualDetail && item.detail?.unit) {
            onPatch(refOf(item.id), { actualDetail: scalarFromNumberWithUnit(next, item.detail.unit) });
        }
    }, [onPatch, item.id, entry?.actualDetail, item.detail?.unit]);

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

    const plannedDetail = item.detail?.value;
    const actualDetail = entry?.actualDetail;
    const usedDetail = actualDetail?.value ?? plannedDetail ?? "";
    const detailDrifted = !!actualDetail && !!plannedDetail && actualDetail.value !== plannedDetail;

    // show the plan alongside whatever drifted, so the intent is never lost
    const note = [
        item.note,
        drifted ? `plan ${planned}` : null,
        detailDrifted ? `plan ${plannedDetail}` : null
    ].filter(Boolean).join(" · ");
    const completed = entry?.completed ?? false;

    return (
        <DataGridRow
            zebra
            label={`${item.name} details`}
            expandContent={item.extra?.length ? (
                <DataGrid>
                    {item.extra.map(detail => (
                        <BatchScheduleItemDetail
                            key={detail.name}
                            detail={detail}
                            value={entry?.date ?? ""}
                            onChange={onChangePitchDate} />
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
            {/* mash grains have no secondary value — checklist only, no third column */}
            {item.detail ? (
                <DataGridInput
                    colStart={3}
                    value={usedDetail}
                    onChange={onChangeDetail}
                    onBlur={onBlurDetail}
                />
            ) : null}
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched tracker/brewable
// branches by reference, editors are stable), so editing one row doesn't
// re-render its siblings
export default memo(BatchScheduleItemRow);
