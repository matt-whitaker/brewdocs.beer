import {KbYeast} from "@brewdocs.beer/kb";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";
import {kbYeastToYeast} from "@/transform/kbYeastToYeast";

export type PlanningYeastsAddRowProps = {
    add: AddFn;
    kbYeasts: KbYeast[];
    kbYeastsIndex: Map<string, KbYeast>;
}

export default function PlanningYeastsAddRow({ add, kbYeasts, kbYeastsIndex }: PlanningYeastsAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addYeast = useCallback(() => {
        if (!selection) return;
        add("yeasts", kbYeastToYeast(kbYeastsIndex!.get(selection)!));
        setSelection(null);
    }, [add, kbYeastsIndex, selection]);

    return (
        <AddRow<KbYeast>
            data={kbYeasts}
            value={selection}
            onChange={setSelection}
            add={addYeast}
            reserveExpand
        />
    );
}
