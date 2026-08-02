import classNames from "classnames";
import {Currency, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Unit} from "@brewdocs.beer/core";
import {InputDate} from "@/components/input-date";
import {InputText} from "@/components/input-text";
import {COL_SPANS, DataGridValueColStart, VALUE_COL_STARTS} from "./styles";


export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
        cols?: number;
        /** which of the three value columns to pin to — ignored on the label side */
        colStart?: DataGridValueColStart;
        /** which half of the row this control belongs to: the value side pins to `colStart`, the label side auto-flows from column 1 and reads left-aligned */
        side?: "label"|"value";
        readonly?: boolean;
        value: string;
        type?: "text"|"date";
        /** accessible name for the control — these grid inputs have no visible <label> */
        label?: string;
        placeholder?: string;
        unit?: Unit | Currency
    };
export function DataGridInput({ colStart = 1, cols = 1, side = "value", readonly = false, value, onChange, onBlur, className, label, placeholder, type = "text" }: DataGridInputProps) {
    const onLabelSide = side === "label";
    const classes = classNames(
        !onLabelSide && VALUE_COL_STARTS[colStart],
        COL_SPANS[cols - 1],
        "self-center",
        [className]
    );
    const align = onLabelSide ? "left" : "right";

    if (type === "date") {
        return (
            <InputDate
                label={label}
                readonly={readonly}
                primary={!readonly}
                value={value}
                align={align}
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
            align={align}
            className={classes}
            onChange={onChange}
            onBlur={onBlur}
        />
    );
}
