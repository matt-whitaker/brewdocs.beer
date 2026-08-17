import {Link} from "@tanstack/react-router";
import {SearchResult} from "@/state/search";

export type EverywhereSearchItemProps = {
    result: SearchResult;
};

export default function EverywhereSearchItem({ result }: EverywhereSearchItemProps) {
    return (
        <li className="card bg-base-100 shadow-sm aspect-[3/4]">
            <Link {...result.link} className="flex h-full flex-col items-center justify-center gap-3 p-3 text-center">
                <span aria-hidden className="size-10 shrink-0 rounded bg-base-300" />
                <span className="line-clamp-3 text-sm">{result.title}</span>
            </Link>
        </li>
    );
}
