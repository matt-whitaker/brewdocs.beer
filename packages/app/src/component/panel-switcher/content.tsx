import {ChangeEvent, PropsWithChildren} from "react";
import classNames from "classnames";

export type PanelSwitcherContentProps = Partial<PropsWithChildren> & {
    title: string;
    active: string
    change: (e: ChangeEvent) => void;
}

export default function PanelSwitcherContent({ title, children, active, change }: PanelSwitcherContentProps) {
    return (
        <>
            <input
                title={!children ? "Not implemented" : ""}
                disabled={!children}
                value={title}
                checked={title === active}
                onChange={change}
                type="radio"
                name={`tab-wrapper-${title}`}
                role="tab"
                className={classNames("tab whitespace-nowrap", { disabled: !children })}
                aria-label={title}
            />
            <div role="tabpanel" className="tab-content bg-base-100 lg:rounded-box">
                {children ? children : <></>}
            </div>
        </>
    )
}