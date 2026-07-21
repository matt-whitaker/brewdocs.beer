import DataGrid from "@/component/data-grid";
import DataGridHeaderRow from "@/component/data-grid/header-row";
import {useCallback, useMemo} from "react";
import {useKbHops} from "@/state/kbHops";
import useIndexBy from "@/hooks/useIndexBy";
import {AddFn, RemoveFn, UpdateFn, UpdateScalarFn} from "@/hooks/useJsonEdit";
import {saveSession, useSession} from "@/state/session";
import RecipeEditHopsRow, {RecipeHop} from "@/screen/recipe-edit-ingredients/hops-row";
import RecipeEditHopsAddRow from "@/screen/recipe-edit-ingredients/hops-add-row";

const SESSION_KEY = "recipe-edit.hops";

export type RecipeEditHopsProps = {
    hops: RecipeHop[];
    add: AddFn;
    remove: RemoveFn;
    update: UpdateFn;
    updateScalar: UpdateScalarFn;
}
export default function RecipeEditHops({ hops, add, remove, update, updateScalar }: RecipeEditHopsProps) {
    const session = useSession();
    const kbHops = useKbHops();
    const kbHopsIndex = useIndexBy(kbHops, "name");

    const onToggleCollapsed = useCallback((collapsed: boolean) => saveSession(SESSION_KEY, collapsed), []);

    const hopRows = useMemo(() => hops.map((hop: RecipeHop, i) => (
        <RecipeEditHopsRow
            key={`hop-${hop.name}-${i}`}
            row={i}
            hop={hop}
            remove={remove}
            update={update}
            updateScalar={updateScalar}
            kbHops={kbHops}
            kbHopsIndex={kbHopsIndex} />
    )), [hops, remove, update, updateScalar, kbHops, kbHopsIndex]);

    return (
        <DataGrid>
            <DataGridHeaderRow
                collapsible
                defaultCollapsed={session?.[SESSION_KEY] as boolean ?? false}
                onToggle={onToggleCollapsed}>
                Hops
            </DataGridHeaderRow>
            {hopRows}
            <RecipeEditHopsAddRow add={add} kbHops={kbHops} kbHopsIndex={kbHopsIndex} />
        </DataGrid>
    );
}
