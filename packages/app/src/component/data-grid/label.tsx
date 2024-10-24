import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type DataGridLabelProps = PropsWithChildren & PropsWithClass & { htmlFor?: string; };
export default function DataGridLabel({ children, className, htmlFor }: DataGridLabelProps) {
    if (htmlFor) {
        return (
            <label
                htmlFor={htmlFor}
                className={classNames(
                    "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer col-span-4",
                    [className]
                )}
            >
                {children}
            </label>
        );
    }
    return (
        <div
            className={classNames(
                "text-sm whitespace-nowrap leading-6 lg:leading-8 has-[input]:hover:cursor-pointer col-span-4",
                [className]
            )}>
            {children}
        </div>
    );
}