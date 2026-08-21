import {Link} from "@tanstack/react-router";
import {StatusBadge} from "@brewdocs.beer/design";
import Navlist from "@/component/navlist";
import SettingsMenu from "@/component/settings-menu";

export type DrawerSidebarProps = { nav: [string, string?][]; close: () => void; };
export default function DrawerSidebar({ nav, close }: DrawerSidebarProps) {
    return (
        <div className="drawer-side z-[20] lg:w-auto w-screen">
            <label htmlFor="drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <div className="bg-primary menu min-h-full w-80 p-4 flex" onClick={close}>
                <div className="indicator">
                    <StatusBadge className="indicator-item indicator-bottom translate-y-6 translate-x-8">alpha</StatusBadge>
                    <Link to="/">
                        <h1 className="mt-2 pl-5 text-4xl font-semibold text-primary-content">Brew<span className="font-light">Docs</span></h1>
                    </Link>
                </div>
                <Navlist nav={nav} />
                <div className="max-lg:hidden mt-auto flex justify-end">
                    <SettingsMenu className="dropdown-top" />
                </div>
            </div>
        </div>
    );
}