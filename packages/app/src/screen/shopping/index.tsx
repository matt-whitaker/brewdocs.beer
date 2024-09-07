"use client";

import Batch from "@/model/batch";
import {ScreenH1, ScreenH3} from "@/component/typography";
import Screen from "@/component/screen";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import useDataGrid from "@/component/data-grid/useDataGrid";
import Recipe from "@/model/recipe";

export default function Shopping({ batch, onChange }: { batch: Batch; recipe: Recipe; onChange: (batch: Batch) => void }) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);

    return (
        <Screen>
            <ScreenH1>Shopping List</ScreenH1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 pt-2">
                {data.shopping.map((category, i) => (
                    <div key={`shopping-${category.name}`}>
                        <ScreenH3>{category.name}</ScreenH3>
                        <DataGrid>
                            {category.items.map((item, j) => (
                                <DataGridRow key={`shopping-item-${item.name}-${j}`}>
                                    <DataGridLabel editable>{item.name}</DataGridLabel>
                                    {item.weight
                                        ? <DataGridInput
                                            value={item.weight}
                                            update={(value: string) => update(`shopping.[${i}].items.[${j}].weight`, value)}
                                            col={1} />
                                        : <></>}
                                    <DataGridInput
                                        value={item.cost}
                                        update={(value: string) => update(`shopping.[${i}].items.[${j}].cost`, value)}
                                        col={2} />
                                    <DataGridCheckbox
                                        checked={item.purchased}
                                        onToggle={() => toggle(`shopping.[${i}].items.[${j}].purchased`)}
                                        col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </div>
                ))}
            </div>
        </Screen>
    );
}