import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export * from "./add-button";
export * from "./add-row";
export * from "./checkbox";
export * from "./header-row";
export * from "./input";
export * from "./label";
export * from "./label-note";
export * from "./remove-button";
export * from "./row";
export * from "./select";
export * from "./styles";
export * from "./subheader-row";

export function DataGrid({ children, className }: PropsWithChildren & PropsWithClass) {
    return (
        <div className={classNames("flex flex-col data-grid [.data-grid_&]:pt-1", [className])}>{children}</div>
    );
}
