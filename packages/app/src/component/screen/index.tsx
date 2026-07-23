import classNames from "classnames";
import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";

export type ScreenProps = PropsWithChildren & PropsWithClass;

export default function Screen({ children, className }: ScreenProps) {
    return <div className={classNames("lg:w-full w-auto h-full px-4 py-2 box-border [&+&]:pt-0", [className])}>{children}</div>;
}