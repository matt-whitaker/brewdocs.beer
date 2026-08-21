import {Link} from "@tanstack/react-router";
import classNames from "classnames";
import {NAV_LINK_MENU, Settings} from "@brewdocs.beer/design";

// A plain DaisyUI focus-within dropdown, per the www topbar precedent — no controlled
// state. `className` carries the open direction, which differs by where it is mounted:
// the mobile top bar drops down, the desktop sidebar (bottom of the drawer) drops up.
export type SettingsMenuProps = { className?: string };

export default function SettingsMenu({ className }: SettingsMenuProps) {
    return (
        <div className={classNames("dropdown dropdown-end", className)}>
            <div tabIndex={0} role="button" aria-label="Settings" className="btn btn-square btn-ghost">
                <Settings className="stroke-primary-content" />
            </div>
            <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[30] w-52 p-2 shadow"
                onClick={() => (document.activeElement as HTMLElement | null)?.blur()}>
                <li><Link to="/backup" className={NAV_LINK_MENU}>Backup</Link></li>
            </ul>
        </div>
    );
}
