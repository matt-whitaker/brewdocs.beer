import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

// The trailing variant shrinks the label to text-xs when it sits in a data-grid
// nested inside another data-grid (an expanded body), matching the tighter
// nested treatment.
const LABEL_CLASS = "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer col-span-4 [.data-grid_.data-grid_&]:text-xs [.data-grid_.data-grid_&]:pl-3";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & { htmlFor?: string; };
export default function DataGridLabel({ children, className, htmlFor }: DataGridLabelProps) {
    if (htmlFor) {
        return (
            <label
                htmlFor={htmlFor}
                className={classNames(LABEL_CLASS, [className])}
            >
                {children}
            </label>
        );
    }
    return (
        <div className={classNames(LABEL_CLASS, [className])}>
            {children}
        </div>
    );
}