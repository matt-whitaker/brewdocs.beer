import {AddFn, RemoveFn, ToggleFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import {useKbYeasts} from "@/state/kbYeasts";
import useIndexBy from "@/hooks/useIndexBy";
import {saveSession, useSession} from "@/state/session";
import RecipeEditYeastsRow, {RecipeYeast} from "@/screen/recipe-edit/yeasts-row";
import RecipeEditYeastsAddRow from "@/screen/recipe-edit/yeasts-add-row";

const SESSION_KEY = "recipe-edit.yeasts";

export type RecipeEditYeastsProps = {
    yeasts: RecipeYeast[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
    toggle: ToggleFn;
}
export default function RecipeEditYeasts({ yeasts, add, remove, update, updateScalar, toggle }: RecipeEditYeastsProps) {
    const session = useSession();
    const kbYeasts = useKbYeasts();
    const kbYeastsIndex = useIndexBy(kbYeasts, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const yeastRows = useMemo(() => yeasts.map((yeast: RecipeYeast, i) => (
        <RecipeEditYeastsRow
            key={`yeast-${yeast.name}-${i}`}
            row={i}
            yeast={yeast}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            toggle={toggle}
            kbYeasts={kbYeasts}
            kbYeastsIndex={kbYeastsIndex} />
    )), [yeasts, remove, update, updateScalar, toggle, kbYeasts, kbYeastsIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Yeast
            </DataGridHeaderRow>
            {yeastRows}
            <RecipeEditYeastsAddRow add={add} kbYeasts={kbYeasts} kbYeastsIndex={kbYeastsIndex} />
        </DataGrid>
    )
}
