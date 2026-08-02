import classNames from "classnames";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {COL_SPANS, COL_STARTS, GridColumn} from "./styles";

export type DataGridSelectProps = PropsWithOnChange<string> & PropsWithClass & {
    data: InputSelectOption[];
    /** accessible name for the control — these grid selects have no visible <label> */
    label?: string;
    value?: string|null;
    allowNull?: boolean;
    /** columns to span when used directly in a row (inert inside a label) */
    cols?: GridColumn;
    /** the grid column to start at. Omit to let the row place it in flow. */
    colStart?: GridColumn;
};
export function DataGridSelect({ className, data, value, onChange, label, allowNull = false, cols = 4, colStart }: DataGridSelectProps) {
    const optionalProps = onChange? { onChange } : {};

    return <InputSelect
        label={label}
        className={classNames(colStart && COL_STARTS[colStart - 1], COL_SPANS[cols - 1], "w-full", [className])}
        value={value ?? null}
        data={data}
        allowNull={allowNull}
        {...optionalProps}
    />;
}
