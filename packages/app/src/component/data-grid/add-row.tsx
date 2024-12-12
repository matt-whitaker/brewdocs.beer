import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridSelect from "@/component/data-grid/select";
import DataGridRow from "@/component/data-grid/row";
import {PropsWithOnClick} from "@brewdocs.beer/core";
import {useCallback, useState} from "react";

export default function <T>({ onClick, data }: PropsWithOnClick<string> & { data: T[] }) {
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