import {memo, useCallback} from "react";
import {Scalar} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridLabelNote from "@/component/data-grid/label-note";
import DataGridRow from "@/component/data-grid/row";
import {ScheduleDetail, ScheduleItem} from "@/model/batch";
import {ResourceType} from "@/model/brewable";
import {Ref, ResourceScalarField, TrackerEntry} from "@/model/tracker";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

const refOf = (id: string): Ref => ({ on: "assignment", id });

/**
 * Which of a resource's fields get an editable column, in order. This is the
 * screen's call, not the model's — `deriveSchedule` passes the whole planned
 * resource through and this decides what's worth showing on brew day.
 *
 * Both plan and actual are read from the *same* key (`item.resource[field]` and
 * `entry.resource[field]`), so adding a field here — e.g. `"alpha"` for hops —
 * needs no model, tracker or derivation change.
 */
const COLUMNS: Record<ResourceType, ResourceScalarField[]> = {
    grain: ["weight"],
    hop: ["weight", "boil"],
    additive: ["weight", "boil"],
    yeast: ["temp"]
};

type ScheduleValueCellProps = {
    /** the row's resource name, so the control has an accessible name ("Northern Brewer weight") */
    name: string;
    field: ResourceScalarField;
    colStart: number;
    planned?: Scalar;
    actual?: Scalar;
    /** patches this row's tracker entry — already bound to the row's ref */
    onPatch: (patch: TrackerEntry) => void;
};

/**
 * One editable column: shows the plan until an as-brewed value is entered, then
 * shows that. Writes only to the tracker — the plan is never overwritten.
 */
function ScheduleValueCell({ name, field, colStart, planned, actual, onPatch }: ScheduleValueCellProps) {
    // the actual may not exist yet, so write a whole scalar and carry the planned
    // field's unit across — formatting on blur needs a unit to fall back on when
    // the user types a bare number
    const onChange = useCallback(
        (next: string) => onPatch({ resource: { [field]: { value: next, unit: planned?.unit } } }),
        [onPatch, field, planned?.unit]
    );
    // focus-then-blur without typing leaves the field unset, and there'd be no unit
    // on the entry yet — only reformat once something is actually recorded
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

/** one row of the nested grid behind a row's expander — brew-day facts, all tracker-backed */
function BatchScheduleItemDetail({ detail, value, onChange }: BatchScheduleItemDetailProps) {
    return (
        <DataGridRow zebra={false}>
            <DataGridLabel tiny cols={3}>{detail.name}</DataGridLabel>
            <DataGridInput label={detail.name} cols={3} type={detail.input === "date" ? "date" : undefined} value={value} onChange={onChange} />
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

    // ⚠️ Records what actually happened; it never writes back over the plan.
    // Editing `brewable.assignments[i].resource.*` from the brew-day screen would
    // overwrite the recipe-derived intent — that's Planning's job.
    const patch = useCallback((next: TrackerEntry) => onPatch(refOf(item.id), next), [onPatch, item.id]);

    // the yeast row's pitch date lives on this same assignment's tracker entry
    const onChangePitchDate = useCallback((next: string) => patch({ date: next }), [patch]);

    // an additive carries only whichever field its shape actually has (priming
    // sugar's weight or a boil-phase additive's boil time); the other resource
    // types always carry every field COLUMNS lists for them, so this filter is a
    // no-op there
    const columns = COLUMNS[item.resourceType].filter(field => item.resource[field] !== undefined);

    // one note per field that came in off-plan, so the intent is never lost
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
            {/* one column per field this resource type exposes — a mash grain gets
                just its weight, a hop weight + boil time. Both plan and actual are
                read from the same key, so the set is driven entirely by COLUMNS. */}
            {columns.map((field, i) => (
                <ValueCell
                    key={field}
                    name={item.name}
                    field={field}
                    colStart={i + 2}
                    planned={item.resource[field]}
                    actual={entry?.resource?.[field]}
                    onPatch={patch}
                />
            ))}
        </DataGridRow>
    );
}

// props are referentially stable (setIn keeps untouched tracker/brewable
// branches by reference, editors are stable), so editing one row doesn't
// re-render its siblings
export default memo(BatchScheduleItemRow);
