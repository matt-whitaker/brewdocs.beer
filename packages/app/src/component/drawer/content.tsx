import {PropsWithChildren} from "react";
import {Hamburger} from "@/component/svg";

export default function DrawerContent({ children }: PropsWithChildren) {
    return (
        <div className="drawer-content flex flex-col items-center justify-center h-full sm:h-auto">
            {/* pl-2 lines the hamburger icon up with the breadcrumb trail below it: the
                icon sits 8px inside its 40px square button, and the breadcrumbs indent
                ml-2+px-2 (16px), so an 8px left pad puts the icon's left edge at 16px too */}
            <div className="lg:hidden fixed left-0 top-0 w-screen bg-primary z-[10] pl-2">
                <label htmlFor="drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <Hamburger className="stroke-primary-content" />
                </label>
            </div>
            {children}
        </div>
    );
}