import {ReactNode, useCallback, useMemo, useRef} from "react";
import {SrmTag, Textarea} from "@brewdocs.beer/design";
import {putEntry} from "@/actions/tracker";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import PanelSwitcher, {PanelSwitcherHandle} from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import useJsonEdit, {SaveFn} from "@/hooks/useJsonEdit";
import useSchedule from "@/hooks/useSchedule";
import Batch, {ScheduleKind} from "@/model/batch";
import {phaseLabel} from "@/model/brewable";
import {byBrewingOrder} from "@/model/scheduleProgress";
import {isRunning} from "@/model/timer";
import {key, Ref, TrackerEntry} from "@/model/tracker";
import {useClock} from "@/providers/clock";
import BatchScheduleBrewTimer from "@/screen/batch-schedule/brew-timer";
import BatchScheduleEquipment from "@/screen/batch-schedule/equipment";
import ScheduleItemRow from "@/screen/batch-schedule/item-row";
import BatchScheduleReading from "@/screen/batch-schedule/reading";
import {readingKindsForPhase} from "@/screen/batch-schedule/reading-kinds";
import BatchScheduleWaterReading from "@/screen/batch-schedule/water-reading";
import {useBatch} from "@/state/batches";
import {saveSession, useSession} from "@/state/session";

const PACKAGING_OPTIONS = [
    { name: "Keg", value: "keg" },
    { name: "Bottle", value: "bottle" },
];

const KIND_LABELS: Record<ScheduleKind, string> = {
    grains: "Grains",
    hops: "Hops",
    yeasts: "Yeasts",
    additives: "Additives"
};

/** within a phase, rows read in the order you'd actually work through them */
const KIND_ORDER: ScheduleKind[] = ["grains", "hops", "additives", "yeasts"];

function srmTag(srm?: string): ReactNode {
    const value = srm?.trim() ? Number(srm) : NaN;

    return Number.isFinite(value) ? <SrmTag srm={value} /> : null;
}

function pauseRunningTimer(batch: Batch, date: string): Partial<Batch> {
    return isRunning(batch.timer) ? { timer: [...batch.timer ?? [], { type: "pause", date }] } : {};
}

export type BatchScheduleProps = { batchId: string; onChange: SaveFn<Batch>; };
export default function BatchSchedule({ batchId, onChange }: BatchScheduleProps) {
    const {now} = useClock();
    const session = useSession();
    const batch = useBatch(batchId);

    const [data, update, , , add, remove, , mutate] = useJsonEdit<Batch>(batch, onChange);
    const schedule = useSchedule(data.brewable);
    const scheduleTabs = useRef<PanelSwitcherHandle>(null);

    const updateDate = useCallback((value: string) => update("brewDate", value), [update]);
    const updatePackaging = useCallback((value: string) => update("packaging", value || undefined), [update]);
    const updateNotes = useCallback((value: string) => update("notes.notes", value), [update]);
    const updateSrm = useCallback((value: string) => update("notes.srm", value), [update]);

    const toggleTrackerCompleted = useCallback((ref: Ref) => {
        mutate(d => ({
            ...d,
            tracker: putEntry(d.tracker, ref, {
                completed: !d.tracker[key(ref)]?.completed,
                date: now().toISOString()
            })
        }), true);
    }, [mutate]);

    const toggleEquipment = useCallback((id: string) => toggleTrackerCompleted({ on: "equipment", id }), [toggleTrackerCompleted]);

    const patchTracker = useCallback((ref: Ref, patch: TrackerEntry) => {
        mutate(d => ({ ...d, tracker: putEntry(d.tracker, ref, patch) }));
    }, [mutate]);

    const completePhase = useCallback((phaseId: string) => {
        mutate(d => {
            const date = now().toISOString();
            return {
                ...d,
                tracker: putEntry(d.tracker, { on: "phase", id: phaseId }, { completed: true, date }),
                ...pauseRunningTimer(d, date)
            };
        }, true);

        const phases = data.brewable.schedule.phases;
        const nextIndex = phases.findIndex(({ id }) => id === phaseId) + 1;
        if (nextIndex > 0 && nextIndex < phases.length) scheduleTabs.current?.activate(phaseLabel(phases, nextIndex));
    }, [mutate, data.brewable.schedule.phases]);

    const panels = useMemo(() => {
        return data.brewable.schedule.phases.map((phase, index) => {
            const inPhase = schedule
                .filter(item => item.phaseId === phase.id)
                .sort((a, b) =>
                    (KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind))
                    || byBrewingOrder(a, b));

            const groups: { label: string; items: typeof inPhase }[] = [];
            inPhase.forEach(item => {
                const label = KIND_LABELS[item.kind];
                const current = groups[groups.length - 1];
                if (current && current.label === label) current.items.push(item);
                else groups.push({ label, items: [item] });
            });

            return { phase, index, groups, equipment: phase.equipment, milestones: phase.milestones };
        });
    }, [data.brewable, schedule]);

    return (
        <Screen>
            <BatchScheduleBrewTimer batch={data} mutate={mutate} completePhase={completePhase} />
            <PanelSwitcher ref={scheduleTabs} compact name="schedule" defaultTab={phaseLabel(data.brewable.schedule.phases, 0)}>
                <PanelSwitcherContent title="Prep">
                    <DataGrid className="pt-2">
                        <DataGridRow>
                            <DataGridLabel cols={3}>Brewed on</DataGridLabel>
                            <DataGridInput cols={3} type="date" value={data.brewDate} onChange={updateDate} />
                        </DataGridRow>
                        <DataGridRow>
                            <DataGridLabel cols={3}>Packaging</DataGridLabel>
                            <DataGridSelect
                                cols={3}
                                label="Packaging"
                                allowNull
                                data={PACKAGING_OPTIONS}
                                value={data.packaging ?? null}
                                onChange={updatePackaging} />
                        </DataGridRow>
                    </DataGrid>
                </PanelSwitcherContent>
                {panels.map(({ phase, index, groups, equipment, milestones }) => {
                    const hasContent = !!(groups.length || equipment.length || milestones.length);

                    const label = phaseLabel(data.brewable.schedule.phases, index);

                    return (
                        <PanelSwitcherContent
                            key={phase.id}
                            title={label}

                            titleAlt={hasContent ? "" : "Nothing scheduled in this step"}>
                            {hasContent ? (
                                <div className="pt-2">
                                    {}
                                    <BatchScheduleEquipment
                                        items={equipment}
                                        tracker={data.tracker}
                                        onToggle={toggleEquipment} />
                                    {groups.map(({ label: groupLabel, items }) => (
                                        <DataGrid key={groupLabel}>
                                            <DataGridHeaderRow
                                                defaultCollapsed={session?.[`schedule.${phase.id}.${groupLabel.toLowerCase()}`] as boolean ?? false}
                                                onToggle={collapsed => saveSession(`schedule.${phase.id}.${groupLabel.toLowerCase()}`, collapsed)}>
                                                {groupLabel}
                                            </DataGridHeaderRow>
                                            {items.map(item => (
                                                <ScheduleItemRow
                                                    key={item.id}
                                                    item={item}

                                                    entry={data.tracker[key({ on: "assignment", id: item.id })]}
                                                    onToggle={toggleTrackerCompleted}
                                                    onPatch={patchTracker}
                                                />
                                            ))}
                                        </DataGrid>
                                    ))}
                                    {}
                                    {readingKindsForPhase(phase.type).map(({ kind, primary, headerLabel, addLabel, defaultLabel, unitOptions, valuePlaceholder }) => (
                                        primary === "waterParameter" ? (
                                            <BatchScheduleWaterReading
                                                key={kind}
                                                phase={phase}
                                                phaseIndex={index}
                                                tracker={data.tracker}
                                                onPatch={patchTracker}
                                                update={update}
                                                add={add}
                                                remove={remove}
                                                headerLabel={headerLabel}
                                                addLabel={addLabel}
                                                defaultLabel={defaultLabel} />
                                        ) : (
                                            <BatchScheduleReading
                                                key={kind}
                                                phase={phase}
                                                phaseIndex={index}
                                                tracker={data.tracker}
                                                onPatch={patchTracker}
                                                update={update}
                                                mutate={mutate}
                                                remove={remove}
                                                kind={kind}
                                                primary={primary}
                                                unitOptions={unitOptions}
                                                valuePlaceholder={valuePlaceholder}
                                                headerLabel={headerLabel}
                                                addLabel={addLabel}
                                                defaultLabel={defaultLabel} />
                                        )
                                    ))}
                                </div>
                            ) : null}
                        </PanelSwitcherContent>
                    );
                })}
                <PanelSwitcherContent title="Notes">
                    <div className="pt-2">
                        <DataGrid className="pb-2">
                            <DataGridRow>
                                <DataGridLabel cols={3}>SRM</DataGridLabel>
                                <div className="col-start-4 flex items-center justify-end self-center">
                                    {srmTag(data.notes?.srm)}
                                </div>
                                <DataGridInput
                                    colStart={5}
                                    cols={2}
                                    label="SRM"
                                    value={data.notes?.srm ?? "0"}
                                    onChange={updateSrm}
                                    onBlur={updateSrm} />
                            </DataGridRow>
                        </DataGrid>
                        <Textarea
                            label="Notes"
                            value={data.notes?.notes ?? ""}
                            onChange={updateNotes}
                            onBlur={updateNotes} />
                    </div>
                </PanelSwitcherContent>
            </PanelSwitcher>
        </Screen>
    );
}
