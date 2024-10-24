import {ChangeEvent, PropsWithChildren, useCallback} from "react";
import classNames from "classnames";
import {eventValue} from "@brewdocs.beer/core";

export type PanelSwitcherContentProps = Partial<PropsWithChildren> & {
    title: string;
    titleAlt?: string;
    active: string
    change: (value: string) => void;
}

export default function PanelSwitcherContent({ title, titleAlt, children, active, change }: PanelSwitcherContentProps) {
    const onChange = useCallback(eventValue(change), [change]);
    return (
        <>
            <input
                title={titleAlt || (!children ? "Not implemented" : "")}
                disabled={!children}
                value={title}
                checked={title === active}
                onChange={onChange}
                type="radio"
                name={`tab-wrapper-${title}`}
                role="tab"
                className={classNames("first-of-type:ml-2 tab whitespace-nowrap lg:px-3 px-2.5", { disabled: !children })}
                aria-label={title}
            />
            <div role="tabpanel" className="tab-content bg-base-100 lg:rounded-box">
                <div>
                    {children ? children : <></>}
                </div>
            </div>
        </>
    )
}