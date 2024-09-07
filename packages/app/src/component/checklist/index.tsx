import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
import {PropsWithChildren} from "react";

export type ButtonChecklistProps = Partial<PropsWithClass> & PropsWithChildren;
export default function Checklist({ className, children }: ButtonChecklistProps) {
    return (
        <ul className={classNames("mt-3 first-of-type:mt-0 grid-flow-col auto-rows-auto lg:columns-4 columns-1 w-full", [className])}>
            {children}
        </ul>
    );
}