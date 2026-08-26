import classNames from "classnames";
import {Currency, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Unit} from "@brewdocs.beer/core";
import {InputDate} from "@/components/input-date";
import {InputText} from "@/components/input-text";
import {InputTime} from "@/components/input-time";
import {COL_SPANS, COL_STARTS, GridColumn, LG_COL_SPANS, LG_COL_STARTS} from "./styles";

/**
 * `mobileCols`/`mobileColStart` are the narrow-screen values, not overrides:
 * supply one and `cols`/`colStart` become the `lg:` value, so the pair reads
 * mobile-first like the rest of the family. Omit them and the emitted classes
 * are exactly what they were before the props existed.
 */
export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
        cols?: GridColumn;
        colStart?: GridColumn;
        mobileCols?: GridColumn;
        mobileColStart?: GridColumn;
        readonly?: boolean;
        value: string;
        type?: "text"|"date"|"time";

        label?: string;
        placeholder?: string;
        unit?: Unit | Currency
    };
export function DataGridInput({ colStart = 4, cols = 1, mobileColStart, mobileCols, readonly = false, value, onChange, onBlur, className, label, placeholder, type = "text" }: DataGridInputProps) {
    const classes = classNames(
        COL_STARTS[(mobileColStart ?? colStart) - 1],
        COL_SPANS[(mobileCols ?? cols) - 1],
        mobileColStart && LG_COL_STARTS[colStart - 1],
        mobileCols && LG_COL_SPANS[cols - 1],
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

    if (type === "time") {
        return (
            <InputTime
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
