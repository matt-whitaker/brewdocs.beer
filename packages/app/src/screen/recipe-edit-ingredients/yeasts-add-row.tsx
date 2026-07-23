import {useCallback, useState} from "react";
import {KbYeast} from "@brewdocs.beer/kb";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {kbYeastToRecipeYeast} from "@/screen/recipe-edit-ingredients/catalog-defaults";

export type RecipeEditYeastsAddRowProps = {
    add: AddFn;
    kbYeasts: KbYeast[];
    kbYeastsIndex: Map<string, KbYeast>;
};

export default function RecipeEditYeastsAddRow({ add, kbYeasts, kbYeastsIndex }: RecipeEditYeastsAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addYeast = useCallback(() => {
        if (!selection) return;
        add("yeasts", kbYeastToRecipeYeast(kbYeastsIndex.get(selection)!));
        setSelection(null);
    }, [add, kbYeastsIndex, selection]);

    return (
        <AddRow<KbYeast>
            data={kbYeasts}
            value={selection}
            onChange={setSelection}
            add={addYeast}
        />
    );
}
