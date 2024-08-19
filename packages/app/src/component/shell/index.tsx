import {PropsWithChildren} from "react";
import Topbar from "../topbar";
import Navlist from "@/component/navlist";
import classNames from "classnames";
import {PropsWithClass} from "@brewdocs.beer/core";
import nav from "@/data/nav";

export type ShellProps = PropsWithChildren & Partial<PropsWithClass>;

export default function Shell({ children, className }: ShellProps) {
    return (
        <div className={classNames("drawer lg:drawer-open lg:max-h-none max-h-[100vh] lg:mt-0 mt-12", [className])}>
            <input id="shell" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content flex flex-col items-center justify-center h-full sm:h-auto">
                <Topbar />
                {children}
            </div>
            <div className="drawer-side z-[20]">
                <label htmlFor="shell" aria-label="close sidebar" className="drawer-overlay"></label>
                <div className="bg-primary menu min-h-full w-80 p-4">
                    <h1 className="pl-5 text-4xl font-semibold">Brew<span className="font-light">Docs</span></h1>
                    <Navlist nav={nav} />
                </div>
            </div>
        </div>
    )
}