import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridSelect from "@/component/data-grid/select";
import DataGridRow from "@/component/data-grid/row";
import {useCallback, useState} from "react";

type PropsWithOnClick = {
    onClick: (value: string) => void;
}

export default function AddRow <T extends { name: string }>({ onClick, data }: PropsWithOnClick & { data: T[] }) {
    const [selection, setSelection] = useState<string|null>(null);
    const _onClick = useCallback(() => {
        if (onClick && selection) onClick(selection);
    }, [onClick, selection]);

    return (
        <DataGridRow>
            <DataGridAddButton onClick={_onClick} />
            <DataGridLabel className="ml-6">
                <DataGridSelect
                    allowNull
                    data={data.map((({ name }) => ({ value: name, name })))}
                    onChange={setSelection}
                />
            </DataGridLabel>
        </DataGridRow>
    )
}