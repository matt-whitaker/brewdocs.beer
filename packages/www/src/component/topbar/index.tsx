import classNames from "classnames";
import {APP_URL} from "@/data/env";
import {Ellipses} from "@/component/svg";

export type TopbarProps = { nav: [string, string, boolean][] }
export default function Topbar({ nav }: TopbarProps) {
    return (
        <div className="navbar bg-primary">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-2xl font-semibold "><span>Brew<span className="font-light">Docs</span></span></a>
            </div>
            <div className="flex-none">
                {nav.map(([name, href, primary]) => (
                    <a
                        className={classNames("btn btn-ghost max-lg:hidden", {
                            "decoration-none": !primary,
                            "btn-sm": !primary,
                            "text-lg": primary
                        })}
                        href={href}>
                        {name}
                    </a>
                ))}
                <button className="btn btn-square btn-ghost lg:hidden">
                    <div className="dropdown dropdown-end">
                        <Ellipses />
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {nav.map(([name, href, primary]) => (
                                <li>
                                    <a href={href}>{name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </button>
            </div>
        </div>
    );
}