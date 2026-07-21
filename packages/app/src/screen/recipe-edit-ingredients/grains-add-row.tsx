import {KbGrain} from "../../../../kb";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {kbGrainToRecipeGrain} from "@/screen/recipe-edit-ingredients/grains-row";

export type RecipeEditGrainsAddRowProps = {
    add: AddFn;
    kbGrains: KbGrain[];
    kbGrainsIndex: Map<string, KbGrain>;
}

export default function RecipeEditGrainsAddRow({ add, kbGrains, kbGrainsIndex }: RecipeEditGrainsAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addGrain = useCallback(() => {
        if (!selection) return;
        add("grains", kbGrainToRecipeGrain(kbGrainsIndex.get(selection)!));
        setSelection(null);
    }, [add, kbGrainsIndex, selection]);

    return (
        <AddRow<KbGrain>
            data={kbGrains}
            value={selection}
            onChange={setSelection}
            add={addGrain}
        />
    );
}
