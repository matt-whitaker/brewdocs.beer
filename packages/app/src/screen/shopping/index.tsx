"use client";

import Batch from "@/model/batch";
import {ScreenH1} from "@/component/typography";
import Screen from "@/component/screen";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import useDataGrid from "@/component/data-grid/useDataGrid";
import Recipe from "@/model/recipe";
import Collapse from "@/component/collapse";
import sessionState, {Session} from "@/state/session";

export type ShoppingProps = {
    batch: Batch;
    recipe: Recipe;
    settings: Session
    onChange: (batch: Batch) => void
};
export default function Shopping({ batch, settings, onChange }: ShoppingProps) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);
    return (
        <Screen>
            <ScreenH1>Shopping List</ScreenH1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 pt-2">
                {data.shopping.map((category, i) => (
                    <Collapse
                        toggle={(open: boolean) => sessionState.set(`shopping.${category.name.toLowerCase()}`, open)}
                        key={`shopping-${category.name}`}
                        title={category.name}
                        className="lg:collapse-open"
                        openInitial={settings[`shopping.${category.name.toLowerCase()}`] ?? category.items.some((item) => item.purchased)}>
                        <DataGrid>
                            {category.items.map((item, j) => (
                                <DataGridRow key={`shopping-item-${item.name}-${j}`}>
                                    <DataGridLabel className="flex items-center" overgrow>
                                        <input
                                            onChange={() => toggle(`shopping.[${i}].items.[${j}].purchased`)}
                                            type="checkbox"
                                            checked={item.purchased}
                                            className="checkbox checkbox-xs mr-2" />
                                        {item.name}
                                    </DataGridLabel>
                                    {item.weight
                                        ? <DataGridInput
                                            readonly
                                            value={item.weight}
                                            update={(value: string) => update(`shopping.[${i}].items.[${j}].weight`, value)}
                                            col={2} />
                                        : <></>}
                                    <DataGridInput
                                        value={item.cost}
                                        update={(value: string) => update(`shopping.[${i}].items.[${j}].cost`, value)}
                                        col={3} />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Collapse>
                ))}
            </div>
        </Screen>
    );
}