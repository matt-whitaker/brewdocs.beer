import Navlist from "@/component/navlist";
import {DEV_TOOLS} from "@/utils/env";

export type DrawerSidebarProps = { nav: [string, string?][]; close: () => void; }
export default function DrawerSidebar({ nav, close }: DrawerSidebarProps) {
    return (
        <div className="drawer-side z-[20] lg:w-auto w-screen">
            <label htmlFor="drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-primary menu min-h-full w-80 p-4 flex" onClick={close}>
                <div className="indicator">
                    <span className="indicator-item indicator-bottom translate-y-5 translate-x-16 font-bold badge badge-accent rounded-box">Proof-of-Concept</span>
                    <h1 className="mt-2 pl-5 text-4xl font-semibold text-primary-content">Brew<span className="font-light">Docs</span></h1>
                </div>
                <Navlist nav={nav} />
                {DEV_TOOLS ? <a onClick={() => {}} className="flex-grow flex items-end justify-end">Dev Tools</a> : null}
            </div>
        </div>
    );
}