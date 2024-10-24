import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {InputDateProps, InputText, InputTextProps} from "@brewdocs.beer/design"
import {PropsWithClass} from "@brewdocs.beer/core";
import {InputDate} from "@brewdocs.beer/design";

export type DataGridInputProps = {
    col: number;
    readonly?: boolean;
    value: string;
    onChange?: (value: string) => void;
    type?: "text"|"number"|"date"
} & PropsWithClass
export default function DataGridInput({ col, readonly = false, value, onChange, className, type }: DataGridInputProps) {
    const optionalProps = onChange? { onChange } : {};
    if (type === "date") {
        return (
            <InputDate
                readonly
                primary={!readonly}
                value={value}
                align="right"
                className={classNames(
                    VALUE_COL_STARTS[col - 1],
                    "self-center col-span-1",
                    [className]
                )}
                {...optionalProps}
            />
        );
    }

    return (
        <InputText
            readonly
            primary={!readonly}
            value={value}
            align="right"
            className={classNames(
                VALUE_COL_STARTS[col - 1],
                "self-center col-span-1",
                [className]
            )}
            {...optionalProps}
        />
    );
}