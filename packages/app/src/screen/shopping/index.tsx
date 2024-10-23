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
import DataGridCheckbox from "@/component/data-grid/checkbox";

export type ShoppingProps = {
    batch: Batch;
    recipe: Recipe;
    session: Session
    onChange: (batch: Batch) => void
};
export default function Shopping({ batch, session, onChange }: ShoppingProps) {
    const [data, update, toggle] = useDataGrid<Batch>(batch, onChange);
    return (
        <Screen>
            <ScreenH1>Shopping List</ScreenH1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 pt-2">{/* this needs to be something */}
                {data.shopping.map((category, i) => (
                    <Collapse
                        toggle={(open: boolean) => sessionState.set(`shopping.${category.name.toLowerCase()}`, open)}
                        key={`shopping-${category.name}`}
                        title={category.name}
                        className="lg:collapse-open"
                        openInitial={session[`shopping.${category.name.toLowerCase()}`] ?? true}>
                        <DataGrid>
                            {category.items.map((item, j) => (
                                <DataGridRow key={`shopping-item-${item.name}-${j}`}>
                                    <DataGridLabel className="flex items-center" htmlFor={`shopping-item-${item.name}-${j}`}>
                                        <DataGridCheckbox
                                            id={`shopping-item-${item.name}-${j}`}
                                            checked={item.purchased}
                                            onChange={() => toggle(`shopping.[${i}].items.[${j}].purchased`)} />
                                        {item.name}{item.weight ? ` - ${item.weight}` : ""}
                                    </DataGridLabel>
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