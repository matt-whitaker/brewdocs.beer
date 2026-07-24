import classNames from "classnames";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";
import {InputSelect, InputSelectOption} from "@/components/input-select";
import {COL_SPANS} from "./styles";

export type DataGridSelectProps = PropsWithOnChange<string> & PropsWithClass & {
    data: InputSelectOption[];
    value?: string|null;
    allowNull?: boolean;
    /** columns to span when used directly in a row (inert inside a label) */
    cols?: number;
};
export function DataGridSelect({ className, data, value, onChange, allowNull = false, cols = 4 }: DataGridSelectProps) {
    const optionalProps = onChange? { onChange } : {};

    return <InputSelect
        className={classNames(COL_SPANS[cols - 1], "w-full", [className])}
        value={value ?? null}
        data={data}
        allowNull={allowNull}
        {...optionalProps}
    />;
}
