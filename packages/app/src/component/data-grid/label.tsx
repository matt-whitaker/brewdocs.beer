import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

// The trailing variants shrink the label when it sits in a data-grid nested
// inside another data-grid (an expanded body); text-2xs (theme token) matches
// daisyui's select-xs/input-xs font size so it lines up with the xs controls.
const LABEL_CLASS = "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer col-span-4 [.data-grid_.data-grid_&]:pl-3";
const TINY = "[.data-grid_.data-grid_&]:text-2xs ml-6 border-l border-solid border-transparent";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & {
    htmlFor?: string;
    tiny?: boolean;
};
export default function DataGridLabel({ children, className, htmlFor, tiny = false }: DataGridLabelProps) {
    if (htmlFor) {
        return (
            <label
                htmlFor={htmlFor}
                className={classNames(LABEL_CLASS, [className], { [TINY]: tiny })}
            >
                {children}
            </label>
        );
    }
    return (
        <div className={classNames(LABEL_CLASS, [className], { [TINY]: tiny })}>
            {children}
        </div>
    );
}