import Batch from "@/model/batch";
import {ScreenH1} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import DataGrid from "@/component/data-grid";
import DataGridRow from "@/component/data-grid/row";
import DataGridLabel from "@/component/data-grid/label";
import DataGridInput from "@/component/data-grid/input";
import useJsonEdit from "@/hooks/useJsonEdit";
import Collapse from "@/component/collapse";
import {saveSession, useSession} from "@/state/session";
import DataGridCheckbox from "@/component/data-grid/checkbox";
import {useBatch} from "@/state/batches";

export type ShoppingProps = {
    batchId: string;
    onChange: (batch: Batch) => void
};
export default function Shopping({ batchId, onChange }: ShoppingProps) {
    const session = useSession();
    const batch = useBatch(batchId);

    const [data, update, updateScalar, toggle] = useJsonEdit<Batch>(batch, onChange);

    return (
        <Screen>
            <ScreenH1>Shopping List</ScreenH1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4 pt-2">{/* this needs to be something */}
                {data.shopping.map((category, i) => (
                    <Collapse
                        toggle={(open: boolean) => saveSession(`shopping.${category.name.toLowerCase()}`, open)}
                        key={`shopping-${category.name}`}
                        title={category.name}
                        className="lg:collapse-open"
                        openInitial={session?.[`shopping.${category.name.toLowerCase()}`] as boolean ?? !category.items.every(({ purchased }) => purchased)}>
                        <DataGrid>
                            {category.items.map((item, j) => (
                                <DataGridRow key={`shopping-item-${item.name}-${j}`}>
                                    <DataGridLabel className="flex items-center" htmlFor={`shopping-item-${item.name}-${j}`}>
                                        <DataGridCheckbox
                                            id={`shopping-item-${item.name}-${j}`}
                                            checked={item.purchased}
                                            onChange={() => toggle(`shopping.[${i}].items.[${j}].purchased`)} />
                                        {item.name}{item.scalar ? ` - ${item.scalar.value}` : ""}
                                    </DataGridLabel>
                                    <DataGridInput
                                        col={3}
                                        value={item.cost.value}
                                        onChange={(value: string) => update(`shopping.[${i}].items.[${j}].cost.value`, value)}
                                        onBlur={(value: string) => updateScalar(`shopping.[${i}].items.[${j}].cost`, value, true)}
                                    />
                                </DataGridRow>
                            ))}
                        </DataGrid>
                    </Collapse>
                ))}
            </div>
        </Screen>
    );
}