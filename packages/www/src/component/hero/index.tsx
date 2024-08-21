import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type HeroProps = Partial<PropsWithClass> & PropsWithChildren & { title: string };
export default function Hero({ children, title, className }: HeroProps) {
    return (
        <div className={classNames("h-screen hero overflow-y-auto bg-base-200", [className])}>
            <div className="hero-content flex-col text-center">
                <h1 className="divider text-3xl">{title}</h1>
                {children}
            </div>
        </div>
    )
}