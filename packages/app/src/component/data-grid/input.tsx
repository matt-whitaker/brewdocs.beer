import classNames from "classnames";
import {VALUE_COL_STARTS} from "@/component/data-grid/classes";
import {InputText} from "@brewdocs.beer/design"
import {Currencies, PropsWithClass, PropsWithOnChange, Units} from "@brewdocs.beer/core";
import {InputDate} from "@brewdocs.beer/design";
import {useCallback} from "react";

export type DataGridInputProps = PropsWithClass & PropsWithOnChange<string> & {
    col: number;
    readonly?: boolean;
    value: string;
    type?: "text"|"date";
    unit?: Units | Currencies
}
export default function DataGridInput({ col, readonly = false, value, onChange, className, unit, type = "text" }: DataGridInputProps) {
    const onBlur = useCallback((value: string) => {
        if (unit && onChange) {
            // do fix
            // if currency
            // fix currency
            // else fix unit
            const fixedValue = value;

            onChange!(fixedValue);
        }
    }, [unit, onChange]);

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
        />
    );
}