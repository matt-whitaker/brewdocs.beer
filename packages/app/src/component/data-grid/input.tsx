import classNames from "classnames";
import {InputText} from "@brewdocs.beer/design"
import {Currencies, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Units} from "@brewdocs.beer/core";
import {InputDate} from "@brewdocs.beer/design";
import {COL_SPANS} from "@/component/data-grid";

export const VALUE_COL_STARTS = ["col-start-4", "col-start-5", "col-start-6"];

export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
    /** which value column to start at (1-3) */
    col: number;
    /** columns to span from `col` */
    cols?: number;
    readonly?: boolean;
    value: string;
    type?: "text"|"date";
    unit?: Units | Currencies
}
export default function DataGridInput({ col, cols = 1, readonly = false, value, onChange, onBlur, className, type = "text" }: DataGridInputProps) {
    const classes = classNames(
        VALUE_COL_STARTS[col - 1],
        COL_SPANS[cols - 1],
        "self-center",
        [className]
    );

    if (type === "date") {
        return (
            <InputDate
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