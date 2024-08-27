import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type CollapseProps = { title: string } & PropsWithChildren & PropsWithClass;
export default function Collapse({ children, title, className }: CollapseProps) {
    return (
        <div tabIndex={0} className={classNames("collapse collapse-arrow", [className])}>
            <input type="checkbox" id="checklist-one" />
            <label htmlFor="checklist-one" className="collapse-title text-xl font-medium">{title}</label>
            <div className="collapse-content">
                {children}
            </div>
        </div>
    );
}