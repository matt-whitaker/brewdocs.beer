import classNames from "classnames";
import {InputSelect, InputSelectOption} from "@brewdocs.beer/design";
import {PropsWithClass, PropsWithOnChange} from "@brewdocs.beer/core";

export type DataGridSelectProps = PropsWithOnChange<string> & PropsWithClass & {
    data: InputSelectOption[];
    value?: string|null;
    allowNull?: boolean;
}
export default function DataGridSelect({ className, data, value, onChange, allowNull = false }: DataGridSelectProps) {
    const optionalProps = onChange? { onChange } : {};

    return <InputSelect
        className={classNames("col-span-4 w-full", [className])}
        value={value ?? null}
        data={data}
        allowNull={allowNull}
        {...optionalProps}
    />;
}