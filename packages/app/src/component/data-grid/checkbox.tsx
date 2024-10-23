
export type DataGridCheckboxProps = {
    checked: boolean;
    onChange: () => void;
    id?: string;
}

export default function DataGridCheckbox({ onChange, checked, id }: DataGridCheckboxProps) {
    return (
        <input
            id={id!}
            onChange={onChange}
            type="checkbox"
            checked={checked}
            className="checkbox checkbox-xs mr-2" />
    );
}