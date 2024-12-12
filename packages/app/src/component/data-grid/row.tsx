import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export default function DataGridRow({ children, className }: PropsWithClass & PropsWithChildren) {
    return (
        <div className={classNames(
            "relative py-1 grid grid-cols-6 gap-x-1 leading-3 align-middle odd:bg-base-200 px-1",
            [className]
        )}>{children}</div>
    )
}