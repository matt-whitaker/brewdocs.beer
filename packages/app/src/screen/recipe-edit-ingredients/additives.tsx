import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import RecipeEditAdditivesAddRow from "@/screen/recipe-edit-ingredients/additives-add-row";
import RecipeEditAdditivesRow, {RecipeAdditive} from "@/screen/recipe-edit-ingredients/additives-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipe-edit.additives";

export type RecipeEditAdditivesProps = {
    additives: RecipeAdditive[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function RecipeEditAdditives({ additives, add, remove, update, updateScalar }: RecipeEditAdditivesProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const additiveRows = useMemo(() => additives.map((additive: RecipeAdditive, i) => (
        <RecipeEditAdditivesRow
            key={`additive-${additive.name}-${i}`}
            row={i}
            additive={additive}
            remove={remove}
            update={update}
            updateScalar={updateScalar} />
    )), [additives, remove, update, updateScalar]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Additives
            </DataGridHeaderRow>
            {additiveRows}
            <RecipeEditAdditivesAddRow add={add} />
        </DataGrid>
    );
}
