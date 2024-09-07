import {PropsWithChildren} from "react";
import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export type ModalTitleProps = PropsWithChildren & PropsWithClass;
export default function ModalTitle({ children, className }: ModalTitleProps) {
    return <h3 className={classNames("font-bold text-lg", [className])}>{children}</h3>
}