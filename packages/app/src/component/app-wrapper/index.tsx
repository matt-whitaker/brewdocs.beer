import {PropsWithChildren} from "react";
import classNames from "classnames";

export interface AppWrapperProps extends PropsWithChildren {
    className?: string;
}

export default function AppWrapper({ children, className }: AppWrapperProps) {
    return (
        <div className={classNames("mx-auto max-w-[860px]", [className])}>
            {children}
        </div>
    );
}