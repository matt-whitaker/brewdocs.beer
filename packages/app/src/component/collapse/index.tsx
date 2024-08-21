import {PropsWithChildren} from "react";

export type CollapseProps = { title: string } & PropsWithChildren;
export default function Collapse({ children, title }: CollapseProps) {
    return (
        <div tabIndex="0" className="collapse collapse-arrow">
            <input type="checkbox" id="checklist-one" />
            <label htmlFor="checklist-one" className="collapse-title text-xl font-medium">{title}</label>
            <div className="collapse-content">
                {children}
            </div>
        </div>
    );
}