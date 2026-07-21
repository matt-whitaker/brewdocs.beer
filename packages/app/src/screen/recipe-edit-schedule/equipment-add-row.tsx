import Equipment from "@/model/equipment";
import {useCallback, useState} from "react";
import AddRow from "@/component/data-grid/add-row";
import {AddFn} from "@/hooks/useJsonEdit";

export type RecipeEditEquipmentAddRowProps = {
    add: AddFn;
    equipment: Equipment[];
    equipmentIndex: Map<string, Equipment>;
};

export default function RecipeEditEquipmentAddRow({ add, equipment, equipmentIndex }: RecipeEditEquipmentAddRowProps) {
    const [selection, setSelection] = useState<string|null>(null);

    const addItem = useCallback(() => {
        if (!selection) return;
        const item = equipmentIndex.get(selection)!;
        add("equipment", { name: item.name, use: item.use, count: item.count });
        setSelection(null);
    }, [add, equipmentIndex, selection]);

    return (
        <AddRow<Equipment>
            data={equipment}
            value={selection}
            onChange={setSelection}
            add={addItem}
        />
    );
}
