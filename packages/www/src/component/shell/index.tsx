import {PropsWithChildren} from "react";
import Topbar from "@/component/topbar";
import nav from "@/data/nav";

export default function Shell({ children }: PropsWithChildren) {
    return (
        <div>
            <Topbar nav={nav}/>
            {children}
        </div>
    )
}