"use client";

import { PropsWithChildren, Children } from "react";
import classNames from "classnames";
import { peerClasses } from "@brewdocs/component/tab-array";
import {ScreenHr} from "@brewdocs/component/typography";

export default function PanelWrapper({ children }: PropsWithChildren) {
    return Children.map(children, (child, i) => (
        <div className={classNames("sm:block hidden overflow-y-auto", peerClasses[i])}>
            {child}
            {i + 1 < Children.count(children) ? <ScreenHr className="divider-neutral" /> : <></>}
        </div>
    ))
}