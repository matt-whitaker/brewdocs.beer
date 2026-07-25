import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import Equipment from "@/model/equipment";
import RecipeEditPhaseEquipmentAddRow from "@/screen/brewable-edit/equipment/phase-equipment-add-row";
import RecipeEditPhaseEquipmentRow from "@/screen/brewable-edit/equipment/phase-equipment-row";
import {saveSession, useSession} from "@/state/session";

export type RecipeEditEquipmentPhaseSectionProps = {
    /** index into brewable.schedule.phases */
    phase: number;
    /** precomputed positional label, e.g. "1. Mash" — see model/brewable's phaseLabel */
    label: string;
    /** this phase's equipment (brewable.schedule.phases[phase].equipment) */
    items: Equipment[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    /** the equipment catalog + name index (built once by the parent) */
    catalog: Equipment[];
    catalogIndex: Map<string, Equipment>;
};

export default function RecipeEditEquipmentPhaseSection({ phase, label, items, add, remove, update, catalog, catalogIndex }: RecipeEditEquipmentPhaseSectionProps) {
    const sessionKey = `recipe-edit.equipment.phase.${phase}`;
    const session = useSession();
    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(sessionKey, collapsed), [sessionKey]);

    const rows = useMemo(() => items.map((item, i) => (
        <RecipeEditPhaseEquipmentRow
            key={`equipment-${phase}-${item.name}-${i}`}
            phase={phase}
            row={i}
            item={item}
            remove={remove}
            update={update}
            equipment={catalog}
            equipmentIndex={catalogIndex} />
    )), [items, phase, remove, update, catalog, catalogIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[sessionKey] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                {label}
            </DataGridHeaderRow>
            {rows}
            <RecipeEditPhaseEquipmentAddRow phase={phase} add={add} equipment={catalog} equipmentIndex={catalogIndex} />
        </DataGrid>
    );
}
