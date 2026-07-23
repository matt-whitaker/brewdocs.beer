import {useCallback, useState} from "react";
import {UNITS} from "@brewdocs.beer/core";
import {KbHop} from "@brewdocs.beer/kb";
import DataGrid from "@/component/data-grid";
import AddRow from "@/component/data-grid/add-row";
import DataGridInput from "@/component/data-grid/input";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import {AddFn} from "@/hooks/useJsonEdit";
import {kbHopToHop} from "@/transform/kbHopToHop";
import {scalarFromNumberWithUnit} from "@/utils/formatting";

export type BatchPlanningHopsAddRowProps = {
    add: AddFn;
    kbHops: KbHop[];
    kbHopsIndex: Map<string, KbHop>;
};

export default function BatchPlanningHopsAddRow({ add, kbHops, kbHopsIndex }: BatchPlanningHopsAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);
    // null = "not overridden" → fall back to the selected hop's kb alpha
    const [actualAlpha, setActualAlpha] = useState<string|null>(null);

    const selectedKbHop = selection ? kbHopsIndex?.get(selection) : undefined;
    const alphaValue = actualAlpha ?? (selectedKbHop ? `${selectedKbHop.alpha}%` : "");

    // a new hop invalidates any alpha the user typed for the previous one
    const onChangeSelection = useCallback((value: string) => {
        setSelection(value);
        setActualAlpha(null);
    }, []);

    const onBlurActualAlpha = useCallback((value: string) => {
        setActualAlpha(value.trim() ? scalarFromNumberWithUnit(value, UNITS.PERCENT).value : null);
    }, []);

    const addHop = useCallback(() => {
        if (!selection) return;
        const hop = kbHopToHop(kbHopsIndex!.get(selection)!);
        if (actualAlpha) {
            hop.alpha = scalarFromNumberWithUnit(actualAlpha, UNITS.PERCENT);
        }
        add("hops", hop);
        setSelection(null);
        setActualAlpha(null);
    }, [add, kbHopsIndex, selection, actualAlpha]);

    return (
        <AddRow<KbHop>
            data={kbHops}
            value={selection}
            onChange={onChangeSelection}
            add={addHop}
            label="hop options"
            expandContent={
                <DataGrid>
                    <DataGridRow>
                        <DataGridLabel tiny className="ml-6">Actual Alpha</DataGridLabel>
                        <DataGridInput
                            colStart={3}
                            value={alphaValue}
                            onChange={setActualAlpha}
                            onBlur={onBlurActualAlpha}
                        />
                    </DataGridRow>
                </DataGrid>
            }
        />
    );
}
