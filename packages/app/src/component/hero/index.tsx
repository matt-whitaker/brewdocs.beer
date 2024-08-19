import {PropsWithChildren} from "react";

export default function Hero({ children }: PropsWithChildren) {
    return (
        <div className="hero bg-base-200 lg:min-h-screen min-h-[calc(100vh-theme(spacing.12))]">
            <div className="hero-content text-center">
                {children}
            </div>
        </div>
    );
}