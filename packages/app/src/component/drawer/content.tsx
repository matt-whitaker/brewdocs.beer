import {PropsWithChildren} from "react";
import {Hamburger} from "@/component/svg";

export default function DrawerContent({ children }: PropsWithChildren) {
    return (
        <div className="drawer-content flex flex-col items-center justify-center h-full sm:h-auto">
            <div className="lg:hidden fixed left-0 top-0 w-screen bg-primary z-[10]">
                <label htmlFor="drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                    <Hamburger className="stroke-primary-content" />
                </label>
            </div>
            {children}
        </div>
    );
}