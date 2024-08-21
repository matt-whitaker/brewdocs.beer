import {PropsWithClass} from "@brewdocs.beer/core"
import classNames from "classnames";
export const Hamburger = ({ className }: PropsWithClass) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className={classNames("inline-block h-6 w-6", [className])}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
)