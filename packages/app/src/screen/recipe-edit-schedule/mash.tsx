import {useCallback, useMemo} from "react";
import {KbRecipe} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import RecipeEditMashAddRow from "@/screen/recipe-edit-schedule/mash-add-row";
import RecipeEditMashRow from "@/screen/recipe-edit-schedule/mash-row";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipeEdit.mash";

export type RecipeEditMashProps = {
    mash: KbRecipe["mash"];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function RecipeEditMash({ mash, add, remove, update, updateScalar }: RecipeEditMashProps) {
    const session = useSession();

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const rows = useMemo(() => mash.map((step, i) => (
        <RecipeEditMashRow
            key={`mash-${step.name}-${i}`}
            row={i}
            step={step}
            remove={remove}
            update={update}
            updateScalar={updateScalar} />
    )), [mash, remove, update, updateScalar]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Mash
            </DataGridHeaderRow>
            {rows}
            <RecipeEditMashAddRow add={add} />
        </DataGrid>
    );
}
