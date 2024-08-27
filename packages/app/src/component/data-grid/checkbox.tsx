import {useCallback} from "react";
import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";

export type DataGridCheckboxProps = {
    checked: boolean;
    onToggle: () => void;
    col: number
}
export default function DataGridCheckbox({ checked, onToggle, col }: DataGridCheckboxProps) {
    const onChange = useCallback(() => onToggle(), [onToggle]);
    return (
        <div className={classNames(VALUE_COL_STARTS[col - 1], "self-center px-1.5 lg:px-2.5 col-span-1 flex justify-center")}>
            <input type="checkbox" onChange={onChange} checked={checked} className="checkbox checkbox-sm" />
        </div>
    )
}