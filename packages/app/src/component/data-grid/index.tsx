import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export default function DataGrid({ children, className }: PropsWithChildren & PropsWithClass) {
    return (
        <div className={classNames("flex flex-col data-grid [.data-grid_&]:pt-1", [className])}>{children}</div>
    );
}
