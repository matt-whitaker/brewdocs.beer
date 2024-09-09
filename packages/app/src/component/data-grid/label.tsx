import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & { overgrow?: boolean };
export default function DataGridLabel({ children, className, overgrow }: DataGridLabelProps) {
    return (
        <label
            className={classNames(
                "text-sm whitespace-nowrap pl-3 leading-6 lg:leading-8 has-[input]:hover:cursor-pointer",
                [overgrow ? "col-span-4" : "col-span-3", className]
            )}>
            {children}
        </label>
    );
}