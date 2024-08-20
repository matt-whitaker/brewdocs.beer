import classNames from "classnames";
import {PropsWithChildren} from "react";

export default function Drawer({ children }: PropsWithChildren) {
    return (
        <div className={classNames("drawer lg:drawer-open lg:max-h-none max-h-[100vh] lg:mt-0 mt-12")}>
            {children}
        </div>
    )
}