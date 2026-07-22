import {ReactNode, useCallback, useMemo} from "react";
import DataGridAddButton from "@/component/data-grid/add-button";
import DataGridLabel from "@/component/data-grid/label";
import DataGridRow from "@/component/data-grid/row";
import DataGridSelect from "@/component/data-grid/select";

export type AddRowProps<T extends { name: string }> = {
    data: T[];
    /** current selection — owned by the parent, which also owns any advanced values */
    value: string|null;
    onChange: (value: string) => void;
    /** commit the current selection; the parent reads its own state */
    add: () => void;
    /** optional advanced config revealed under the row — expected to be its own <DataGrid> */
    expandContent?: ReactNode;
    /** accessible label for the expand toggle, e.g. "hop options" */
    label?: string;

    reserveExpand?: boolean;
};

export default function AddRow<T extends { name: string }>({ data, value, onChange, add, expandContent, label, reserveExpand = false }: AddRowProps<T>) {
    const options = useMemo(() => data.map(({ name }) => ({ value: name, name })), [data]);
    const onClick = useCallback(() => {
        if (value) {
            add();
        }
    }, [add, value]);

    return (
        <DataGridRow zebra expandContent={expandContent} label={label} reserveExpand={reserveExpand}>
            <DataGridAddButton onClick={onClick} />
            <DataGridLabel className="ml-6">
                <DataGridSelect
                    allowNull
                    value={value}
                    data={options}
                    onChange={onChange}
                />
            </DataGridLabel>
        </DataGridRow>
    );
}
