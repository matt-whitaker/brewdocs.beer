import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithOptionalClass} from "@/component/prop-types";

export type ScreenContainerProps = PropsWithChildren & PropsWithOptionalClass

export default function Screen({ children, className }: ScreenContainerProps) {
    return <div className={classNames("w-full h-full p-4", [className])}>{children}</div>
}