import {PropsWithChildren} from "react";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";

export type HeroProps = Partial<PropsWithClass> & PropsWithChildren & { title: string };
export default function Hero({ children, title, className }: HeroProps) {
    return (
        <div className={classNames("w-screen h-screen hero overflow-y-auto bg-base-200", [className])}>
            <div className="hero-content flex-col text-center">
                <h1 className="lg:divider lg:text-3xl text-2xl">{title}</h1>
                {children}
            </div>
        </div>
    )
}