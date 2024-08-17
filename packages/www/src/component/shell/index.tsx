import {PropsWithChildren} from "react";
import Topbar from "@/component/topbar";

export default function Shell({ children }: PropsWithChildren) {
    return (
        <div>
            <Topbar />
            {children}
        </div>
    )
}