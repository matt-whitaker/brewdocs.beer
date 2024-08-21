import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type HeroProps = Partial<PropsWithClass> & PropsWithChildren & { title: string };
export default function Hero({ children, title, className }: HeroProps) {
    return (
        <div className={classNames("h-[calc(100vh-theme(spacing.16))] hero bg-base-200", [className])}>
            <div className="hero-content flex-col text-center">
                <h1 className="text-5xl font-bold">{title}</h1>
                {children}
            </div>
        </div>
    )
}