import {APP_URL} from "@/data/env";

export default function Topbar() {
    return (
        <div className="navbar bg-primary">
            <div className="flex-1">
                <a href="/" className="btn btn-ghost text-2xl">BrewDocs</a>
            </div>
            <div className="flex-none">
                <a className="btn btn-sm btn-ghost max-lg:hidden decoration-none" href="/about">About</a>
                <a className="btn btn-sm btn-ghost max-lg:hidden decoration-none" href="/release">Release Notes</a>
                <a className="btn btn-ghost text-lg max-lg:hidden" href={APP_URL}>Go to app</a>
                <button className="btn btn-square btn-ghost lg:hidden">
                    <div className="dropdown dropdown-end">
                        <svg
                            tabIndex={0}
                            role="button"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            className="inline-block h-5 w-5 stroke-current">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                        </svg>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/about">About</a></li>
                            <li><a href="/release">Release Notes</a></li>
                            <li><a href={APP_URL}>Got to app</a></li>
                        </ul>
                    </div>
                </button>
            </div>
        </div>
    );
}