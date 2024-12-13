import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridSelect from "@/component/data-grid/select";
import DataGridRow from "@/component/data-grid/row";
import {useCallback, useState} from "react";

type PropsWithOnClick = {
    add: (value: string) => void;
}

export default function AddRow <T extends { name: string }>({ add, data }: PropsWithOnClick & { data: T[] }) {
    const [selection, setSelection] = useState<string|null>(null);
    const onClick = useCallback(() => {
        if (add && selection) {
            add(selection);
            setSelection(null);
        }
    }, [add, selection]);

    return (
        <DataGridRow>
            <DataGridAddButton onClick={onClick} />
            <DataGridLabel className="ml-6">
                <DataGridSelect
                    allowNull
                    value={selection}
                    data={data.map((({ name }) => ({ value: name, name })))}
                    onChange={(value) => {
                        setSelection(value);
                    }}
                />
            </DataGridLabel>
        </DataGridRow>
    )
}