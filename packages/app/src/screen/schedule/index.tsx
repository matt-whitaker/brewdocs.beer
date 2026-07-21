import Batch, {ScheduleKind} from "@/model/batch";
import {ScreenH1} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import ScheduleItemRow from "@/screen/schedule/item-row";
import ScheduleEquipment from "@/screen/schedule/equipment";
import useJsonEdit from "@/hooks/useJsonEdit";
import {saveSession, useSession} from "@/state/session";
import {useBatch} from "@/state/batches";
import {get} from "@/utils/func";
import {useMemo} from "react";
import Scalar from "@/model/scalar";

// "equipment" never appears in batch.schedule (it lives on phase.equipment,
// rendered separately by ScheduleEquipment) — listed for Record completeness
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

export type ScheduleProps = { batchId: string; onChange: (batch: Batch) => void; };
export default function Schedule({ batchId, onChange }: ScheduleProps) {
    const session = useSession();
    const batch = useBatch(batchId);

    const [data, update, updateScalar, toggle] = useJsonEdit<Batch>(batch, onChange);

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
            <ScreenH1 className="mb-2">Brew Schedule</ScreenH1>
            <PanelSwitcher compact name="schedule" defaultTab={data.phases[0].name}>
                {panels.map(({ phase, index, groups }) => (
                    <PanelSwitcherContent
                        key={phase.name}
                        title={phase.name}
                        // a phase with nothing in it renders as a disabled tab; say why,
                        // or it inherits the switcher's "Not implemented" tooltip
                        titleAlt={groups.length || phase.equipment.length ? "" : "Nothing scheduled in this step"}>
                        {groups.length || phase.equipment.length ? (
                            <div className="pt-2">
                                {/* what to gather before the phase starts, ahead of the work itself */}
                                <ScheduleEquipment
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
