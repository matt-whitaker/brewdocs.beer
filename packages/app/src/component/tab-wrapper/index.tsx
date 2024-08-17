"use client";

import {useCallback, useState} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@/component/prop-types";

export type TabWrapperProps = Partial<PropsWithClass> & {
    tabs: [[string, React.ReactNode], [string, React.ReactNode]?, [string, React.ReactNode]?, [string, React.ReactNode]?];
    name?: string;
}

export default function TabWrapper({ tabs, className }: TabWrapperProps) {
    const [checked, setChecked] = useState(0);
    const onChange = useCallback(({ target: { value } }) => setChecked(Number(value)), []);
    return (
        <div className="w-full h-full lg:p-4">
            <div role="tablist" className={classNames("tabs tabs-boxed", [className])}>
                {tabs.map(([name, jsx], i) => [
                    <input
                        value={i}
                        checked={i === checked}
                        onChange={onChange}
                        type="radio"
                        name={`tab-wrapper-${name ?? "name"}`}
                        role="tab"
                        className="tab whitespace-nowrap"
                        aria-label={name} />,
                    <div role="tabpanel" className="tab-content bg-base-100 border-base-300 lg:rounded-box">
                        {jsx}
                    </div>
                ])}
            </div>
        </div>
    );
}
