import {useCallback, useMemo} from "react";
import {Scalar} from "@brewdocs.beer/core";
import {ScreenH1} from "@brewdocs.beer/design";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import Batch, {phaseLabel, ScheduleKind} from "@/model/batch";
import {statuses} from "@/model/statuses";
import BatchScheduleEquipment from "@/screen/batch-schedule/equipment";
import ScheduleItemRow from "@/screen/batch-schedule/item-row";
import {useBatch} from "@/state/batches";
import {saveSession, useSession} from "@/state/session";
import {get} from "@/utils/func";

const STATUS_OPTIONS = Object.entries(statuses).map(([value, name]) => ({name, value}));

// "equipment" never appears in batch.schedule (it lives on phase.equipment,
// rendered separately by BatchScheduleEquipment) — listed for Record completeness
const KIND_LABELS: Record<ScheduleKind, string> = {
    grains: "Grains",
    hops: "Hops",
    yeasts: "Yeasts",
    additives: "Additives",
    gravity: "Gravity",
    equipment: "Equipment"
};

/** within a phase, rows read in the order you'd actually work through them */
const KIND_ORDER: ScheduleKind[] = ["grains", "hops", "additives", "yeasts", "gravity"];

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

    const updateStatus = useCallback((value: string) => update("status", Number(value)), [update]);

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

            return { phase, index, groups };
        });
    }, [data.schedule, data.phases]);

    return (
        <Screen>
            <DataGrid className="mt-2 mb-2">
                <DataGridRow>
                    <DataGridLabel cols={3}>Status</DataGridLabel>
                    <DataGridSelect cols={3} data={STATUS_OPTIONS} value={String(data.status)} onChange={updateStatus} />
                </DataGridRow>
            </DataGrid>
            <PanelSwitcher compact name="schedule" defaultTab={data.phases[0].name}>
                {panels.map(({ phase, index, groups }) => (
                    <PanelSwitcherContent
                        key={phase.name}
                        title={phase.name}
                        label={phaseLabel(phase, index)}
                        // a phase with nothing in it renders as a disabled tab; say why,
                        // or it inherits the switcher's "Not implemented" tooltip
                        titleAlt={groups.length || phase.equipment.length ? "" : "Nothing scheduled in this step"}>
                        {groups.length || phase.equipment.length ? (
                            <div className="pt-2">
                                {/* what to gather before the phase starts, ahead of the work itself */}
                                <BatchScheduleEquipment
                                    phase={index}
                                    phaseName={phase.name}
                                    items={phase.equipment}
                                    toggle={toggle} />
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
                            </div>
                        ) : null}
                    </PanelSwitcherContent>
                ))}
            </PanelSwitcher>
        </Screen>
    );
}
