import {useCallback, useMemo} from "react";
import {Scalar} from "@brewdocs.beer/core";
import deriveSchedule from "@/actions/deriveSchedule";
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

    const [data, update, updateScalar, , add, remove, , mutate] = useJsonEdit<Batch>(batch, onChange);

    const updateStatus = useCallback((value: string) => update("status", Number(value)), [update]);

    // tracker writes can't go through useJsonEdit's dot-path (a key like
    // "equipment:<uuid>" isn't addressable that way — see CLAUDE.md's Model
    // boundary), so they use `mutate`: it hands `putEntry` the freshest draft and
    // stays referentially stable, so ticking one box doesn't re-render the whole
    // list. Shared by the equipment checklist and the ingredient rows' checkoff;
    // immediate (like the old checkbox toggle), not debounced.
    const toggleTrackerCompleted = useCallback((ref: Ref) => {
        mutate(d => ({ ...d, tracker: putEntry(d.tracker, ref, { completed: !d.tracker[key(ref)]?.completed }) }), true);
    }, [mutate]);

    const toggleEquipment = useCallback((id: string) => toggleTrackerCompleted({ on: "equipment", id }), [toggleTrackerCompleted]);

    // gravity/milestone edits are typed, so they debounce (no `immediate`),
    // matching the rest of useJsonEdit's field editing
    const patchTracker = useCallback((ref: Ref, patch: TrackerEntry) => {
        mutate(d => ({ ...d, tracker: putEntry(d.tracker, ref, patch) }));
    }, [mutate]);

    const panels = useMemo(() => {
        // a pure view of the brewable, like equipment and gravity below — the batch
        // stores no schedule copy, so this memo is the whole cache story
        const schedule = deriveSchedule(data.brewable);

        return data.phases.map((phase, index) => {
            // intersection: an item is in the phase only if it carries every configured tag
            const inPhase = schedule
                .filter(item => phase.tags.every(tag => item.tags.includes(tag)))
                .sort((a, b) =>
                    (KIND_ORDER.indexOf(a.tags[1]) - KIND_ORDER.indexOf(b.tags[1]))
                    || a.name.localeCompare(b.name));

            // sorted, so a group is a run of adjacent items sharing a kind; each run
            // becomes its own DataGrid, which is what bounds the collapse rule to it
            const groups: { label: string; items: typeof inPhase }[] = [];
            inPhase.forEach(item => {
                const label = KIND_LABELS[item.tags[1]];
                const current = groups[groups.length - 1];
                if (current && current.label === label) current.items.push(item);
                else groups.push({ label, items: [item] });
            });

            // live off the brewable — matched to this tab by phase type, not stored on Phase
            const type = phaseTypeOf(phase);
            const equipment = type
                ? data.brewable.schedule.phases.filter(p => p.type === type).flatMap(p => p.equipment)
                : [];

            // config-driven now — a phase's own milestones, not derived from the brewable
            const milestones = phase.milestones;

            return { phase, index, groups, equipment, milestones };
        });
    }, [data.phases, data.brewable]);

    return (
        <Screen>
            <DataGrid className="mt-2 mb-2">
                <DataGridRow>
                    <DataGridLabel cols={3}>Status</DataGridLabel>
                    <DataGridSelect cols={3} data={STATUS_OPTIONS} value={String(data.status)} onChange={updateStatus} />
                </DataGridRow>
            </DataGrid>
            <PanelSwitcher compact name="schedule" defaultTab={data.phases[0].name}>
                {panels.map(({ phase, index, groups, equipment, milestones }) => (
                    <PanelSwitcherContent
                        key={phase.name}
                        title={phase.name}
                        label={phaseLabel(phase, index)}
                        // a phase with nothing in it renders as a disabled tab; say why,
                        // or it inherits the switcher's "Not implemented" tooltip
                        titleAlt={groups.length || equipment.length || milestones.length ? "" : "Nothing scheduled in this step"}>
                        {groups.length || equipment.length || milestones.length ? (
                            <div className="pt-2">
                                {/* what to gather before the phase starts, ahead of the work itself */}
                                <BatchScheduleEquipment
                                    items={equipment}
                                    tracker={data.tracker}
                                    onToggle={toggleEquipment} />
                                {groups.map(({ label, items }) => (
                                    <DataGrid key={label}>
                                        <DataGridHeaderRow
                                            defaultCollapsed={session?.[`schedule.${phase.name.toLowerCase()}.${label.toLowerCase()}`] as boolean ?? false}
                                            onToggle={collapsed => saveSession(`schedule.${phase.name.toLowerCase()}.${label.toLowerCase()}`, collapsed)}>
                                            {label}
                                        </DataGridHeaderRow>
                                        {items.map(item => (
                                            <ScheduleItemRow
                                                key={item.id}
                                                item={item}
                                                // the ingredient's live value, never a copy on the item
                                                value={valueAt(data, item.path)}
                                                extraValues={item.extra?.map(detail => detail.path ? valueAt(data, detail.path) : "")}
                                                entry={data.tracker[key({ on: "assignment", id: item.id })]}
                                                onToggle={toggleTrackerCompleted}
                                                onPatch={patchTracker}
                                                update={update}
                                                updateScalar={updateScalar}
                                            />
                                        ))}
                                    </DataGrid>
                                ))}
                                {/* readings come after the work — the wort's measured as the phase ends */}
                                <BatchScheduleGravity
                                    phase={phase}
                                    phaseIndex={index}
                                    tracker={data.tracker}
                                    onPatch={patchTracker}
                                    update={update}
                                    add={add}
                                    remove={remove} />
                            </div>
                        ) : null}
                    </PanelSwitcherContent>
                ))}
            </PanelSwitcher>
        </Screen>
    );
}
