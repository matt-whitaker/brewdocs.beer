import {useCallback, useMemo} from "react";
import {KbRecipe} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import equipmentCatalog from "@/data/equipment";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn} from "@/hooks/useJsonEdit";
import RecipeEditEquipmentAddRow from "@/screen/recipe-edit-schedule/equipment-add-row";
import RecipeEditEquipmentRow from "@/screen/recipe-edit-schedule/equipment-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipeEdit.equipment";

export type RecipeEditEquipmentProps = {
    equipment: KbRecipe["equipment"];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
};
export default function RecipeEditEquipment({ equipment, add, remove, update }: RecipeEditEquipmentProps) {
    const session = useSession();
    const equipmentIndex = useIndexBy(equipmentCatalog, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => equipment.map((item, i) => (
        <RecipeEditEquipmentRow
            key={`equipment-${item.name}-${i}`}
            row={i}
            item={item}
            remove={remove}
            update={update}
            equipment={equipmentCatalog}
            equipmentIndex={equipmentIndex} />
    )), [equipment, remove, update, equipmentIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Equipment
            </DataGridHeaderRow>
            {rows}
            <RecipeEditEquipmentAddRow add={add} equipment={equipmentCatalog} equipmentIndex={equipmentIndex} />
        </DataGrid>
    );
}
