import classNames from "classnames";
import {InputText} from "@brewdocs.beer/design"
import {Currencies, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Units} from "@brewdocs.beer/core";
import {InputDate} from "@brewdocs.beer/design";

export const VALUE_COL_STARTS = ["col-start-4", "col-start-5", "col-start-6"];

export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
    col: number;
    readonly?: boolean;
    value: string;
    type?: "text"|"date";
    unit?: Units | Currencies
}
export default function DataGridInput({ col, readonly = false, value, onChange, onBlur, className, type = "text" }: DataGridInputProps) {
    if (type === "date") {
        return (
            <InputDate
                readonly={readonly}
                primary={!readonly}
                value={value}
                align="right"
                className={classNames(
                    VALUE_COL_STARTS[col - 1],
                    "self-center col-span-1",
                    [className]
                )}
                onChange={onChange}
            />
        );
    }

    return (
        <InputText
            readonly={readonly}
            primary={!readonly}
            value={value}
            align="right"
            className={classNames(
                VALUE_COL_STARTS[col - 1],
                "self-center col-span-1",
                [className]
            )}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
}