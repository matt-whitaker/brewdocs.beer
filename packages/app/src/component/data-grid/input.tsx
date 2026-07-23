import classNames from "classnames";
import {Currency, PropsWithClass, PropsWithOnBlur, PropsWithOnChange, Unit} from "@brewdocs.beer/core";
import {InputText} from "@brewdocs.beer/design";
import {InputDate} from "@brewdocs.beer/design";
import {COL_SPANS, VALUE_COL_STARTS} from "@/component/data-grid/styles";


export type DataGridInputProps = PropsWithClass
    & PropsWithOnChange<string>
    & PropsWithOnBlur<string>
    & {
        cols?: number;
        colStart?: number;
        readonly?: boolean;
        value: string;
        type?: "text"|"date";
        unit?: Unit | Currency
    };
export default function DataGridInput({ colStart = 1, cols = 1, readonly = false, value, onChange, onBlur, className, type = "text" }: DataGridInputProps) {
    const classes = classNames(
        VALUE_COL_STARTS[colStart - 1],
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