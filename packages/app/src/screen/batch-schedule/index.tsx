import {useCallback, useMemo, useRef} from "react";
import {Scalar} from "@brewdocs.beer/core";
import {putEntry} from "@/actions/tracker";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import Batch, {Phase, phaseLabel, SchedulePhase, ScheduleKind} from "@/model/batch";
import {statuses} from "@/model/statuses";
import {key, Ref, TrackerEntry} from "@/model/tracker";
import BatchScheduleEquipment from "@/screen/batch-schedule/equipment";
import BatchScheduleGravity from "@/screen/batch-schedule/gravity";
import ScheduleItemRow from "@/screen/batch-schedule/item-row";
import {useBatch} from "@/state/batches";
import {saveSession, useSession} from "@/state/session";
import {get} from "@/utils/func";

const STATUS_OPTIONS = Object.entries(statuses).map(([value, name]) => ({name, value}));

const KIND_LABELS: Record<ScheduleKind, string> = {
    grains: "Grains",
    hops: "Hops",
    yeasts: "Yeasts",
    additives: "Additives"
};

/** within a phase, rows read in the order you'd actually work through them */
const KIND_ORDER: ScheduleKind[] = ["grains", "hops", "additives", "yeasts"];

const SCHEDULE_PHASES: SchedulePhase[] = ["mash", "boil", "ferment"];

/** the SchedulePhase a Phase maps to, read off its own tags rather than its (renamable) name */
const phaseTypeOf = (phase: Phase): SchedulePhase | undefined =>
    phase.tags.find((tag): tag is SchedulePhase => (SCHEDULE_PHASES as string[]).includes(tag));

/** a schedule path lands on either a Scalar or a plain string (the dates) */
function valueAt(data: Batch, path: string): string {
    const node = get(data, path);
    return typeof node === "string" ? node : (node as Scalar|undefined)?.value ?? "";
}

export type BatchScheduleProps = { batchId: string; onChange: (batch: Batch) => void; };
export default function BatchSchedule({ batchId, onChange }: BatchScheduleProps) {
    const session = useSession();
    const batch = useBatch(batchId);

    const [data, update, updateScalar, toggle] = useJsonEdit<Batch>(batch, onChange);

    // toggleEquipment reads/writes through this ref rather than closing over
    // `data`, so its identity stays stable across the screen's other edits —
    // ticking one box doesn't re-render the whole equipment list
    const dataRef = useRef(data);
    dataRef.current = data;

    const updateStatus = useCallback((value: string) => update("status", Number(value)), [update]);

    // tracker writes never go through useJsonEdit's dot-path (a key like
    // "equipment:<uuid>" isn't addressable that way — see CLAUDE.md's Model
    // boundary) — putEntry computes the next tracker and this saves it straight
    // through the batch save path, mirroring BatchPlanning's onChangeBrewable
    const toggleEquipment = useCallback((id: string) => {
        const ref = { on: "equipment" as const, id };
        const completed = dataRef.current.tracker[key(ref)]?.completed ?? false;
        onChange({ ...dataRef.current, tracker: putEntry(dataRef.current.tracker, ref, { completed: !completed }) });
    }, [onChange]);

    // gravity/milestone edits are typed, so they route through useJsonEdit's
    // debounced `update` (setting the whole `tracker` object at a top-level path,
    // since a "milestone:..." key isn't dot-path addressable) rather than the
    // immediate onChange the equipment toggle uses
    const patchTracker = useCallback((ref: Ref, patch: TrackerEntry) => {
        update("tracker", putEntry(dataRef.current.tracker, ref, patch));
    }, [update]);

    const panels = useMemo(() => {
        // keep each item's index, so edit paths point at the real position in
        // batch.schedule no matter how the tabs and groups rearrange the display
        const entries = data.schedule.map((item, index) => ({ item, index }));

        return data.phases.map((phase, index) => {
            // intersection: an item is in the phase only if it carries every configured tag
            const inPhase = entries
                .filter(({ item }) => phase.tags.every(tag => item.tags.includes(tag)))
                .sort((a, b) =>
                    (KIND_ORDER.indexOf(a.item.tags[1]) - KIND_ORDER.indexOf(b.item.tags[1]))
                    || a.item.name.localeCompare(b.item.name));

            // sorted, so a group is a run of adjacent items sharing a kind; each run
            // becomes its own DataGrid, which is what bounds the collapse rule to it
            const groups: { label: string; entries: typeof inPhase }[] = [];
            inPhase.forEach(entry => {
                const label = KIND_LABELS[entry.item.tags[1]];
                const current = groups[groups.length - 1];
                if (current && current.label === label) current.entries.push(entry);
                else groups.push({ label, entries: [entry] });
            });

            // live off the brewable — matched to this tab by phase type, not stored on Phase
            const type = phaseTypeOf(phase);
            const equipment = type
                ? data.brewable.schedule.phases.filter(p => p.type === type).flatMap(p => p.equipment)
                : [];

            // one post-reading per mash/boil brewable phase (ferment gets none in v1)
            const gravity = type === "mash" || type === "boil"
                ? data.brewable.schedule.phases
                    .filter(p => p.type === type)
                    .map(p => ({ phaseId: p.id!, label: `Post-${type}` }))
                : [];

            return { phase, index, groups, equipment, gravity };
        });
    }, [data.schedule, data.phases, data.brewable]);

    return (
        <Screen>
            <DataGrid className="mt-2 mb-2">
                <DataGridRow>
                    <DataGridLabel cols={3}>Status</DataGridLabel>
                    <DataGridSelect cols={3} data={STATUS_OPTIONS} value={String(data.status)} onChange={updateStatus} />
                </DataGridRow>
            </DataGrid>
            <PanelSwitcher compact name="schedule" defaultTab={data.phases[0].name}>
                {panels.map(({ phase, index, groups, equipment, gravity }) => (
                    <PanelSwitcherContent
                        key={phase.name}
                        title={phase.name}
                        label={phaseLabel(phase, index)}
                        // a phase with nothing in it renders as a disabled tab; say why,
                        // or it inherits the switcher's "Not implemented" tooltip
                        titleAlt={groups.length || equipment.length || gravity.length ? "" : "Nothing scheduled in this step"}>
                        {groups.length || equipment.length || gravity.length ? (
                            <div className="pt-2">
                                {/* what to gather before the phase starts, ahead of the work itself */}
                                <BatchScheduleEquipment
                                    items={equipment}
                                    tracker={data.tracker}
                                    onToggle={toggleEquipment} />
                                {groups.map(({ label, entries }) => (
                                    <DataGrid key={label}>
                                        <DataGridHeaderRow
                                            defaultCollapsed={session?.[`schedule.${phase.name.toLowerCase()}.${label.toLowerCase()}`] as boolean ?? false}
                                            onToggle={collapsed => saveSession(`schedule.${phase.name.toLowerCase()}.${label.toLowerCase()}`, collapsed)}>
                                            {label}
                                        </DataGridHeaderRow>
                                        {entries.map(({ item, index }) => (
                                            <ScheduleItemRow
                                                key={`${item.tags[1]}-${item.name}-${index}`}
                                                row={index}
                                                item={item}
                                                // the ingredient's live value, never a copy on the item
                                                value={valueAt(data, item.path)}
                                                extraValues={item.extra?.map(({ path }) => valueAt(data, path))}
                                                toggle={toggle}
                                                update={update}
                                                updateScalar={updateScalar}
                                            />
                                        ))}
                                    </DataGrid>
                                ))}
                                {/* readings come after the work — the wort's measured as the phase ends */}
                                <BatchScheduleGravity
                                    readings={gravity}
                                    tracker={data.tracker}
                                    onPatch={patchTracker} />
                            </div>
                        ) : null}
                    </PanelSwitcherContent>
                ))}
            </PanelSwitcher>
        </Screen>
    );
}
