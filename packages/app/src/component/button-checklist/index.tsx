import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
import {PropsWithChildren} from "react";

export type ButtonChecklistProps = Partial<PropsWithClass> & PropsWithChildren;
export default function ButtonChecklist({ className, children }: ButtonChecklistProps) {
    return (
        <ul className={classNames("mt-3 grid-flow-col auto-rows-auto lg:columns-3 columns-1 w-full", [className])}>
            {children}
        </ul>
    );
}