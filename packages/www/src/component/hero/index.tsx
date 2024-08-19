import {PropsWithChildren} from "react";

export type HeroProps = PropsWithChildren & { title: string };
export default function Hero({ children, title }: HeroProps) {
    return (
        <div className="h-[calc(100vh-theme(spacing.16))] hero bg-base-200">
            <div className="hero-content flex-col text-center">
                <h1 className="text-5xl font-bold">{title}</h1>
                {children}
            </div>
        </div>
    )
}