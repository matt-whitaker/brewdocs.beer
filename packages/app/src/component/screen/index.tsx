import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@/component/prop-types";

export type ScreenContainerProps = PropsWithChildren & Partial<PropsWithClass>

export default function Screen({ children, className }: ScreenContainerProps) {
    return <div className={classNames("w-full h-full p-4", [className])}>{children}</div>
}