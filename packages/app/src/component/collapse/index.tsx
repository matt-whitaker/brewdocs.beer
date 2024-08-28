import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type CollapseProps = { title: string } & PropsWithChildren & PropsWithClass;
export default function Collapse({ children, title, className }: CollapseProps) {
    return (
        <div tabIndex={0} className={classNames("collapse max-lg:collapse-arrow", [className])}>
            <input type="checkbox" id={`collapse-${title}`} />
            <label htmlFor={`collapse-${title}`} className="collapse-title text-xl font-medium px-0 after:-mr-2">{title}</label>
            <div className="collapse-content px-0">
                {children}
            </div>
        </div>
    );
}