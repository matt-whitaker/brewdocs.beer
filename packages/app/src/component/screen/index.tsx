import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type ScreenContainerProps = PropsWithChildren & Partial<PropsWithClass>

export default function Screen({ children, className }: ScreenContainerProps) {
    return <div className={classNames("lg:w-full w-auto h-full px-4 p-4 box-border [&+&]:pt-0", [className])}>{children}</div>
}