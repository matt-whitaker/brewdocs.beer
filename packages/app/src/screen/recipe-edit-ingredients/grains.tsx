import {useCallback, useMemo} from "react";
import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import RecipeEditGrainsAddRow from "@/screen/recipe-edit-ingredients/grains-add-row";
import RecipeEditGrainsRow, {RecipeGrain} from "@/screen/recipe-edit-ingredients/grains-row";
import {useKbGrains} from "@/state/kbGrains";
import {saveSession, useSession} from "@/state/session";

const SESSION_KEY = "recipe-edit.grains";

export type RecipeEditGrainsProps = {
    grains: RecipeGrain[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
};
export default function RecipeEditGrains({ grains, add, remove, update, updateScalar }: RecipeEditGrainsProps) {
    const session = useSession();
    const kbGrains = useKbGrains();
    const kbGrainsIndex = useIndexBy(kbGrains, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const grainRows = useMemo(() => grains.map((grain: RecipeGrain, i) => (
        <RecipeEditGrainsRow
            key={`grain-${grain.name}-${i}`}
            row={i}
            grain={grain}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbGrains={kbGrains}
            kbGrainsIndex={kbGrainsIndex} />
    )), [remove, update, updateScalar, kbGrains, kbGrainsIndex, grains]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Grains
            </DataGridHeaderRow>
            {grainRows}
            <RecipeEditGrainsAddRow add={add} kbGrains={kbGrains} kbGrainsIndex={kbGrainsIndex} />
        </DataGrid>
    );
}
