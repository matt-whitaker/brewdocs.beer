import {PropsWithChildren} from "react";
import classNames from "classnames";

export type ScreenContainerProps = PropsWithChildren & { className?: string }

export default function ScreenContainer({ children, className }: ScreenContainerProps) {
    return <div className={classNames("w-full h-full p-5", [className])}>{children}</div>
}