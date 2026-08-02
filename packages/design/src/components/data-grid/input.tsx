import classNames from "classnames";
import {Currency, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Unit} from "@brewdocs.beer/core";
import {InputDate} from "@/components/input-date";
import {InputText} from "@/components/input-text";
import {COL_SPANS, COL_STARTS, GridColumn} from "./styles";


export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
        cols?: GridColumn;
        colStart?: GridColumn;
        readonly?: boolean;
        value: string;
        type?: "text"|"date";
        /** accessible name for the control — these grid inputs have no visible <label> */
        label?: string;
        placeholder?: string;
        unit?: Unit | Currency
    };
export function DataGridInput({ colStart = 4, cols = 1, readonly = false, value, onChange, onBlur, className, label, placeholder, type = "text" }: DataGridInputProps) {
    const classes = classNames(
        COL_STARTS[colStart - 1],
        COL_SPANS[cols - 1],
        "self-center",
        [className]
    );

    if (type === "date") {
        return (
            <InputDate
                label={label}
                readonly={readonly}
                primary={!readonly}
                value={value}
                align="right"
                className={classes}
                onChange={onChange}
            />
        );
    }

    return (
        <InputText
            label={label}
            placeholder={placeholder}
            readonly={readonly}
            primary={!readonly}
            value={value}
            align="right"
            className={classes}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
}
