import {Hamburger} from "@/component/svg";

export default function Topbar() {
    return (
        <div className="lg:hidden fixed left-0 top-0 w-full bg-primary z-[10]">
            <label htmlFor="drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
                <Hamburger />
            </label>
        </div>
    );
}