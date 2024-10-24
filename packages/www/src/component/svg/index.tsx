import {PropsWithClass} from "@brewdocs.beer/core";
import classNames from "classnames";

export const Ellipses = ({ className }: PropsWithClass) => (
    <svg

        tabIndex={0}
        role="button"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className={classNames("inline-block h-5 w-5 stroke-current", [className])}>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
    </svg>
)