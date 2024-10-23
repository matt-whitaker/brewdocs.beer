import classNames from "classnames";
import {Ellipses} from "@/component/svg";
import Link from "next/link";

export type TopbarProps = { nav: [string, string, boolean?][] }
export default function Topbar({ nav }: TopbarProps) {
    return (
        <div className="navbar bg-primary fixed z-50">
            <div className="flex-1">
                <Link href="/" className="btn btn-ghost text-2xl font-semibold text-primary-content"><span>Brew<span className="font-light">Docs</span></span></Link>
            </div>
            <div className="flex-none">
                {nav.map(([name, href, primary]) => (
                    <Link
                        key={name}
                        className={classNames("btn btn-ghost max-lg:hidden", {
                            "decoration-none": !primary,
                            "btn-sm": !primary,
                            "text-lg": primary
                        })}
                        href={href}>
                        {name}
                    </Link>
                ))}
                <button className="btn btn-square btn-ghost lg:hidden">
                    <div className="dropdown dropdown-end">
                        <Ellipses className="stroke-primary-content" />
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {nav.map(([name, href, primary]) => (
                                <li key={name}>
                                    <Link href={href}>{name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </button>
            </div>
        </div>
    );
}