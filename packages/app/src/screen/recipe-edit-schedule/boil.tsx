import {KbRecipe} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {useCallback, useMemo} from "react";
import {saveSession, useSession} from "@/state/session";
import RecipeEditBoilRow from "@/screen/recipe-edit-schedule/boil-row";
import RecipeEditBoilAddRow from "@/screen/recipe-edit-schedule/boil-add-row";

const SESSION_KEY = "recipeEdit.boil";

export type RecipeEditBoilProps = {
    boil: KbRecipe["boil"];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function RecipeEditBoil({ boil, add, remove, update, updateScalar }: RecipeEditBoilProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => boil.map((step, i) => (
        <RecipeEditBoilRow
            key={`boil-${step.name}-${i}`}
            row={i}
            step={step}
            remove={remove}
            update={update}
            updateScalar={updateScalar} />
    )), [boil, remove, update, updateScalar]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Boil
            </DataGridHeaderRow>
            {rows}
            <RecipeEditBoilAddRow add={add} />
        </DataGrid>
    );
}
