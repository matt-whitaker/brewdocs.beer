"use client";

import {useCallback, useState} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import {ScreenH4} from "@/component/typography";

export type TabWrapperProps = Partial<PropsWithClass> & {
    tabs: [
        [string, React.ComponentType|false],
        [string, React.ComponentType|false]?,
        [string, React.ComponentType|false]?,
        [string, React.ComponentType|false]?];
    name?: string;
}

export default function TabScreens({ tabs, className }: TabWrapperProps) {
    const [checked, setChecked] = useState(tabs.findIndex(([, jsx]) => !!jsx));
    const onChange = useCallback(({ target: { value } }) => setChecked(Number(value)), []);

    return (
        <div className={classNames("mt-2 w-full h-full lg:p-4 p-0", [className])}>
            <div role="tablist" className="tabs tabs-boxed">
                {tabs.map(([name, Screen], i) => [
                    <input
                        title={!Screen ? "Not implemented" : ""}
                        disabled={!Screen}
                        value={i}
                        checked={i === checked}
                        onChange={onChange}
                        type="radio"
                        name={`tab-wrapper-${name ?? "name"}`}
                        role="tab"
                        className={classNames("tab whitespace-nowrap", { disabled: !Screen })}
                        aria-label={name}
                    />,
                    <div role="tabpanel" className="tab-content bg-base-100 lg:rounded-box">
                        {Screen ? <Screen /> : <></>}
                    </div>
                ])}
            </div>
        </div>
    );
}
