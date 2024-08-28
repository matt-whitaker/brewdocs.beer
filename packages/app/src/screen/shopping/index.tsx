"use client";

import Error from "@/component/error";
import Batch from "@/model/batch";
import {ScreenH2, ScreenH3} from "@/component/typography";
import Screen from "@/component/screen";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import useDataGrid from "@/component/data-grid/useDataGrid";

export default function Shopping({ batch, onChange }: { batch: Batch; onChange: (batch: Batch) => void }) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);

    const recipe = batch?.recipe;
    if (!recipe) return <Error>'recipe' missing</Error>;

    return (
        <Screen>
            <ScreenH2>Shopping List</ScreenH2>
            <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
                {data.shopping.map((category, i) => (
                    <div key={`shopping-${category.name}`}>
                        <ScreenH3>{category.name}</ScreenH3>
                        <DataGrid>
                            {category.items.map((item, j) => (
                                <DataGridRow key={`hop-${item.name}-${j}`}>
                                    <DataGridLabel editable>{item.name}</DataGridLabel>
                                    {item.scalar
                                        ? <DataGridInput
                                            value={item.scalar}
                                            update={(value: string) => update(`shopping.[${i}].items.[${j}].scalar`, value)}
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