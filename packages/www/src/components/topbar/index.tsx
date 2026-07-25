import classNames from "classnames";
import {Ellipses} from "@/components/svg";

export type TopbarProps = { nav: [string, string, boolean?][] };
export default function Topbar({ nav }: TopbarProps) {
    return (
        <div className="navbar bg-primary fixed z-50">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-2xl font-semibold text-primary-content"><span>Brew<span className="font-light">Docs</span></span></a>
            </div>
            <div className="flex-none">
                {nav.map(([name, href, cta]) => (
                    <a
                        key={name}
                        className={classNames("btn text-lg capitalize max-lg:hidden", {
                            "btn-ghost": !cta,
                            "bg-base-200 text-base-content border-base-200 hover:opacity-90": cta
                        })}
                        href={href}>
                        {name}
                    </a>
                ))}
                <button className="btn btn-square btn-ghost lg:hidden">
                    <div className="dropdown dropdown-end">
                        <Ellipses className="stroke-primary-content" />
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {nav.map(([name, href]) => (
                                <li key={name}>
                                    <a href={href} className="capitalize">{name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </button>
            </div>
        </div>
    );
}
