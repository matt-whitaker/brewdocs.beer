import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
import {PropsWithChildren} from "react";

export type PanelSwitcherProps = PropsWithChildren & Partial<PropsWithClass>

export default function PanelSwitcher({ children, className }: PanelSwitcherProps) {
    return (
        <div className={classNames("mt-2 lg:w-full w-screen h-full lg:px-4", [className])}>
            <div role="tablist" className="tabs tabs-boxed px-0 lg:w-auto w-screen">
                {children}
            </div>
        </div>
    )
}