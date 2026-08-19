import {memo, useCallback} from "react";
import {Scalar} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridRow from "@/component/data-grid/row";
import {GridColumn, gridColumn} from "@/component/data-grid/styles";
import {ScheduleDetail, ScheduleItem} from "@/model/batch";
import {ResourceType} from "@/model/brewable";
import {Ref, ResourceScalarField, TrackerEntry} from "@/model/tracker";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

const refOf = (id: string): Ref => ({ on: "assignment", id });

const COLUMNS: Record<ResourceType, ResourceScalarField[]> = {
    grain: ["weight"],
    hop: ["weight", "boil"],
    additive: ["weight", "boil"],
    yeast: ["temp"]
};

type ScheduleValueCellProps = {
    name: string;
    field: ResourceScalarField;
    colStart: GridColumn;
    planned?: Scalar;
    actual?: Scalar;

    onPatch: (patch: TrackerEntry) => void;
};

function ScheduleValueCell({ name, field, colStart, planned, actual, onPatch }: ScheduleValueCellProps) {
    const onChange = useCallback(
        (next: string) => onPatch({ resource: { [field]: { value: next, unit: planned?.unit } } }),
        [onPatch, field, planned?.unit]
    );

    const onBlur = useCallback((next: string) => {
        if (actual && planned?.unit) {
            onPatch({ resource: { [field]: scalarFromNumberWithUnit(next, planned.unit) } });
        }
    }, [onPatch, field, actual, planned?.unit]);

    return (
        <DataGridInput
            label={`${name} ${field}`}
            colStart={colStart}
            value={actual?.value ?? planned?.value ?? ""}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
}

const ValueCell = memo(ScheduleValueCell);

type BatchScheduleItemDetailProps = {
    detail: ScheduleDetail;
    value: string;
    onChange: (next: string) => void;
};

function BatchScheduleItemDetail({ detail, value, onChange }: BatchScheduleItemDetailProps) {
    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{detail.name}</DataGridLabel>
            <DataGridInput label={detail.name} cols={2} colStart={5} type={detail.input === "date" ? "date" : undefined} value={value} onChange={onChange} />
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

    const patch = useCallback((next: TrackerEntry) => onPatch(refOf(item.id), next), [onPatch, item.id]);

    const onChangePitchDate = useCallback((next: string) => patch({ date: next }), [patch]);

    const columns = COLUMNS[item.resourceType].filter(field => item.resource[field] !== undefined);

    const drifts = columns
        .map(field => ({ planned: item.resource[field]?.value, actual: entry?.resource?.[field]?.value }))
        .filter(({ planned, actual }) => !!actual && !!planned && actual !== planned)
        .map(({ planned }) => `plan ${planned}`);

    const note = [item.note, ...drifts].filter(Boolean).join(" · ");
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
                            value={entry?.date?.slice(0, 10) ?? ""}
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
            {}
            {columns.map((field, i) => (
                <ValueCell
                    key={field}
                    name={item.name}
                    field={field}
                    colStart={gridColumn(i + 5)}
                    planned={item.resource[field]}
                    actual={entry?.resource?.[field]}
                    onPatch={patch}
                />
            ))}
        </DataGridRow>
    );
}

export default memo(BatchScheduleItemRow);
