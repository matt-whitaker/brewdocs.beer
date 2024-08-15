"use client";

import { PropsWithChildren, Children } from "react";
import classNames from "classnames";
import { peerClasses } from "@brewdocs/components/tab-array";

export default function TabWrapper({ children }: PropsWithChildren) {
    return Children.map(children, (child, i) => (
        <div className={classNames("sm:block hidden", peerClasses[i])}>
            {child}
        </div>
    ))
}