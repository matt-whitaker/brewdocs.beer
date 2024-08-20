import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
import {PropsWithChildren} from "react";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass>

export default function PanelSwitcher({ children, className }: PanelSwitcherProps) {
    return (
        <div className={classNames("mt-2 w-full h-full lg:p-4 p-0", [className])}>
            <div role="tablist" className="tabs tabs-boxed">
                {children}
            </div>
        </div>
    )
}