import {memo, useCallback} from "react";
import {ScheduleDetail, ScheduleItem} from "@/model/batch";
import {ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridInput from "@/component/data-grid/input";
import DataGridCheckbox from "@/component/data-grid/checkbox";

type BatchScheduleItemDetailProps = {
    detail: ScheduleDetail;
    value: string;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}

/** one row of the nested grid behind a row's expander */
function BatchScheduleItemDetail({ detail, value, update, updateScalar }: BatchScheduleItemDetailProps) {
    // a date is a plain string at the path, not a scalar, so it's written whole
    const onChangeDate = useCallback((next: string) => update(detail.path, next), [update, detail.path]);
    const onChangeValue = useCallback((next: string) => update(`${detail.path}.value`, next), [update, detail.path]);
    const onBlurValue = useCallback((next: string) => updateScalar(detail.path, next), [updateScalar, detail.path]);

    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{detail.name}</DataGridLabel>
            {detail.input === "date" ? (
                <DataGridInput col={1} cols={3} type="date" value={value} onChange={onChangeDate} />
            ) : (
                <DataGridInput
                    col={3}
                    readonly={detail.readonly}
                    value={value}
                    onChange={detail.readonly ? undefined : onChangeValue}
                    onBlur={detail.readonly ? undefined : onBlurValue}
                />
            )}
        </DataGridRow>
    );
}

export type BatchScheduleItemRowProps = {
    /** index into batch.schedule — display order is sorted, so this is the real position */
    row: number;
    item: ScheduleItem;
    /** live value at item.path, read by the screen so this stays a dumb row */
    value: string;
    /** live values for item.extra, in the same order; absent when there are none */
    extraValues?: string[];
    toggle: ToggleFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}

function BatchScheduleItemRow({ row, item, value, extraValues, toggle, update, updateScalar }: BatchScheduleItemRowProps) {
    const id = `schedule-item-${item.tags[0]}-${item.tags[1]}-${item.name}`;
    const amountPath = `schedule[${row}].actual`;

    const onToggleCompleted = useCallback(() => toggle(`schedule[${row}].completed`), [toggle, row]);

    // writes through to the ingredient itself — item.path, never a copy on the item
    const onChangeValue = useCallback((next: string) => update(`${item.path}.value`, next), [update, item.path]);
    const onBlurValue = useCallback((next: string) => updateScalar(item.path, next), [updateScalar, item.path]);

    // `actual` may not exist yet, so write the whole scalar and carry the planned
    // amount's unit across — updateScalar needs a unit to fall back on when the
    // user types a bare number
    const onChangeAmount = useCallback(
        (next: string) => update(amountPath, { value: next, unit: item.amount?.unit }),
        [update, amountPath, item.amount?.unit]
    );
    // focus-then-blur without typing leaves `actual` unset, and updateScalar reads
    // the unit off the existing scalar — so there'd be nothing there to read
    const onBlurAmount = useCallback((next: string) => {
        if (item.actual) updateScalar(amountPath, next);
    }, [updateScalar, amountPath, item.actual]);

    const planned = item.amount?.value;
    const used = item.actual?.value ?? planned ?? "";
    // once what went in differs from the plan, show the plan alongside it
    const drifted = !!item.actual && !!planned && item.actual.value !== planned;
    const note = [item.note, drifted ? `plan ${planned}` : null].filter(Boolean).join(" · ");

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
                            value={extraValues?.[i] ?? ""}
                            update={update}
                            updateScalar={updateScalar} />
                    ))}
                </DataGrid>
            ) : undefined}
            reserveExpand
        >
            <DataGridLabel className="flex items-center" htmlFor={id}>
                <DataGridCheckbox
                    id={id}
                    checked={item.completed}
                    onChange={onToggleCompleted} />
                {item.name}
                {note ? <DataGridLabelNote>({note})</DataGridLabelNote> : null}
            </DataGridLabel>
            {item.amount ? (
                <DataGridInput
                    col={2}
                    value={used}
                    onChange={onChangeAmount}
                    onBlur={onBlurAmount}
                />
            ) : null}
            <DataGridInput
                col={3}
                readonly={item.readonly}
                value={value}
                onChange={item.readonly ? undefined : onChangeValue}
                onBlur={item.readonly ? undefined : onBlurValue}
            />
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched branches, editors are
// stable), so editing one row no longer re-renders its siblings
export default memo(BatchScheduleItemRow);
