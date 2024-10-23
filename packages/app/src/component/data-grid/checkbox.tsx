
export type DataGridCheckboxProps = {
    checked: boolean;
    onChange: () => void;
}

export default function DataGridCheckbox({ onChange, checked }: DataGridCheckboxProps) {
    return (
        <input
            onChange={onChange}
            type="checkbox"
            checked={checked}
            className="checkbox checkbox-xs mr-2" />
    );
}