import {memo, useCallback} from "react";
import {UNITS} from "@brewdocs.beer/core";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {key, Ref, TrackerEntry} from "@/model/tracker";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

/** one gravity milestone slot — a post-reading on a mash or boil brewable phase */
export type GravityReading = { phaseId: string; label: string };

const refOf = (phaseId: string): Ref => ({ on: "milestone", phaseId, when: "post", kind: "gravity" });

type BatchScheduleGravityItemProps = {
    reading: GravityReading;
    entry: TrackerEntry | undefined;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
};

function BatchScheduleGravityItem({ reading: { phaseId, label }, entry, onPatch }: BatchScheduleGravityItemProps) {
    // the reading is a raw scalar while typing, formatted to °P on blur — mirrors
    // the ingredient rows' updateScalar, but written to the tracker not a path
    const onChangeReading = useCallback((next: string) => onPatch(refOf(phaseId), { reading: { value: next, unit: UNITS.PLATO } }), [onPatch, phaseId]);
    const onBlurReading = useCallback((next: string) => onPatch(refOf(phaseId), { reading: scalarFromNumberWithUnit(next, UNITS.PLATO) }), [onPatch, phaseId]);
    // exact date taken matters less than the reading, so it rides behind the expander
    const onChangeDate = useCallback((next: string) => onPatch(refOf(phaseId), { date: next }), [onPatch, phaseId]);

    return (
        <DataGridRow
            zebra
            label={`${label} reading`}
            expandContent={(
                <DataGrid>
                    <DataGridRow zebra={false}>
                        <DataGridLabel tiny cols={3}>Reading Taken</DataGridLabel>
                        <DataGridInput cols={3} type="date" value={entry?.date ?? ""} onChange={onChangeDate} />
                    </DataGridRow>
                </DataGrid>
            )}
            reserveExpand
        >
            <DataGridLabel>{label}</DataGridLabel>
            <DataGridInput colStart={3} value={entry?.reading?.value ?? ""} onChange={onChangeReading} onBlur={onBlurReading} />
        </DataGridRow>
    );
}

// props are primitives plus a stable onPatch, so editing one reading doesn't
// re-render the rest — same reasoning as the equipment list
const Item = memo(BatchScheduleGravityItem);

export type BatchScheduleGravityProps = {
    readings: GravityReading[];
    tracker: Record<string, TrackerEntry>;
    onPatch: (ref: Ref, patch: TrackerEntry) => void;
};

/**
 * Post-phase gravity reads (one per mash/boil brewable phase), each keyed to a
 * `{on:"milestone", phaseId, when:"post", kind:"gravity"}` entry in `batch.tracker`.
 * Its own DataGrid so the collapse rule scopes to these rows, like Equipment.
 */
export default function BatchScheduleGravity({ readings, tracker, onPatch }: BatchScheduleGravityProps) {
    if (!readings.length) return null;

    return (
        <DataGrid>
            <DataGridHeaderRow collapsible>Gravity</DataGridHeaderRow>
            {readings.map(reading => (
                <Item
                    key={reading.phaseId}
                    reading={reading}
                    entry={tracker[key(refOf(reading.phaseId))]}
                    onPatch={onPatch} />
            ))}
        </DataGrid>
    );
}
