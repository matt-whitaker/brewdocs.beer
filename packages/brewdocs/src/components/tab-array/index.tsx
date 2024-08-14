"use client";

import classNames from "classnames";
import {useCallback, useState} from "react";

export interface TabArrayProps {
    tabs: string[];
}

const peerClasses = [
    ["peer/tab-1", "peer-checked/tab-1:font-semibold peer-checked/tab-1:outline"],
    ["peer/tab-2", "peer-checked/tab-2:font-semibold peer-checked/tab-2:outline"],
    ["peer/tab-3", "peer-checked/tab-3:font-semibold peer-checked/tab-3:outline"],
    ["peer/tab-4", "peer-checked/tab-4:font-semibold peer-checked/tab-4:outline"],
    ["peer/tab-5", "peer-checked/tab-5:font-semibold peer-checked/tab-5:outline"]
];

export default function TabArray({ tabs }: TabArrayProps) {
    const [checked, setChecked] = useState(0);
    return (
        <div className="w-full flex justify-around peer/array sm:hidden">
            {tabs.map((tab, i) =>
                <input
                    key={i}
                    onChange={useCallback(() => setChecked(i), [i])}
                    id={`tab-${i}`}
                    type="radio"
                    value={i}
                    checked={i === checked}
                    name="tab-array"
                    className={classNames("hidden", peerClasses[i][0])} />
            )}
            {tabs.map((tab, i) =>
                <label
                    key={i}
                    className={classNames(peerClasses[i][1], "outline-1 rounded-lg text-sm cursor-pointer mt-5 p-1")}
                    htmlFor={`tab-${i}`}>
                    {tab}
                </label>
            )}
        </div>
    )
}