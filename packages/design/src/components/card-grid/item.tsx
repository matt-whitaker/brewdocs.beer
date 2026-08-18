import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type CardGridItemProps = PropsWithChildren & PropsWithClass;

export function CardGridItem({ children, className }: CardGridItemProps) {
    return (
        <li className={classNames("relative rounded-box border border-base-300 bg-base-200 shadow-sm p-4", [className])}>
            {children}
        </li>
    );
}
