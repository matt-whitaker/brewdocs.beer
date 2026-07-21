import {KbGrain} from "@brewdocs.beer/kb";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {kbGrainToGrain} from "@/transform/kbGrainToGrain";

export type BatchPlanningGrainsAddRowProps = {
    add: AddFn;
    kbGrains: KbGrain[];
    kbGrainsIndex: Map<string, KbGrain>;
}

export default function BatchPlanningGrainsAddRow({ add, kbGrains, kbGrainsIndex }: BatchPlanningGrainsAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addGrain = useCallback(() => {
        if (!selection) return;
        add("grains", kbGrainToGrain(kbGrainsIndex.get(selection)!));
        setSelection(null);
    }, [add, kbGrainsIndex, selection]);

    return (
        <AddRow<KbGrain>
            data={kbGrains}
            value={selection}
            onChange={setSelection}
            add={addGrain}
            reserveExpand
        />
    );
}
