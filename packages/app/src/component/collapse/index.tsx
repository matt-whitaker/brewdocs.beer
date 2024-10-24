import {PropsWithChildren, useCallback} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type CollapseProps = { title: string; openInitial?: boolean; toggle?: (open: boolean) => void } & PropsWithChildren & PropsWithClass;
export default function Collapse({ children, title, className, openInitial, toggle }: CollapseProps) {
    const onChange = useCallback(({ target }: { target: HTMLInputElement }) => toggle?.(target.checked), [toggle]);
    return (
        <div tabIndex={0} className={classNames("collapse max-lg:collapse-arrow min-h-2", [className])}>
            <input className="min-h-2 peer" type="checkbox" id={`collapse-${title}`} defaultChecked={!!openInitial} onChange={onChange} />
            <label htmlFor={`collapse-${title}`} className="min-h-2 collapse-title text-xl font-medium px-0 py-1 after:-mr-2 after:-mt-3">{title}</label>
            <div className="collapse-content px-0 pb-2 peer-checked:pb-0">
                {children}
            </div>
        </div>
    );
}