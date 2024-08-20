import Navlist from "@/component/navlist";
import nav from "@/data/nav";
import {useCallback} from "react";

export type DrawerSidebarProps = { nav: [string, string?][]; close: () => void; }
export default function DrawerSidebar({ nav, close }: DrawerSidebarProps) {
    return (
        <div className="drawer-side z-[20]">
            <label htmlFor="drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-primary menu min-h-full w-80 p-4" onClick={close}>
                <h1 className="pl-5 text-4xl font-semibold">Brew<span className="font-light">Docs</span></h1>
                <Navlist nav={nav} />
            </div>
        </div>
    );
}