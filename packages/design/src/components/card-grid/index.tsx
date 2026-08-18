import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type CardGridProps = PropsWithChildren & PropsWithClass;

export function CardGrid({ children, className }: CardGridProps) {
    return (
        <ul className={classNames("w-full grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3", [className])}>
            {children}
        </ul>
    );
}
