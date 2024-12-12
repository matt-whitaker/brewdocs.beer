import classNames from "classnames";
import {InputSelect, InputSelectOption} from "@brewdocs.beer/design/src/components/input-select";
import {PropsWithClass, PropsWithOnChange} from "../../../../core";

export type DataGridSelectProps = PropsWithOnChange<string> & PropsWithClass & {
    data: InputSelectOption[];
    value?: string;
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