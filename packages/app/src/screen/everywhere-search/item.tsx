import {Link} from "@tanstack/react-router";
import {SearchResult} from "@/state/search";

export type EverywhereSearchItemProps = {
    result: SearchResult;
};

export default function EverywhereSearchItem({ result }: EverywhereSearchItemProps) {
    return (
        <li className="card bg-base-100 shadow-sm">
            <Link {...result.link} className="flex flex-row items-center gap-3 p-3 text-left">
                <span aria-hidden className="size-6 shrink-0 rounded bg-base-300" />
                <span className="truncate">{result.title}</span>
            </Link>
        </li>
    );
}
