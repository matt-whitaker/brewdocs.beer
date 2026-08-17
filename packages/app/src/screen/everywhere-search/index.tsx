import {useState} from "react";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import SearchBar from "@/component/search-bar";
import EverywhereSearchItem from "@/screen/everywhere-search/item";
import {useRecentBatches, useSearchEverywhere} from "@/state/search";

const TILE_GRID = "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

export default function EverywhereSearch() {
    const [query, setQuery] = useState("");
    const results = useSearchEverywhere(query);
    const recent = useRecentBatches();
    const searched = query.trim().length > 0;

    return (
        <div className="w-full">
            <div className="flex justify-end">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="What are you looking for?"
                    className="sm:max-w-xs"
                />
            </div>
            {searched
                ? (results.length > 0
                    ? (
                        <ul className={TILE_GRID}>
                            {results.map(result => (
                                <EverywhereSearchItem key={`${result.kind}:${result.id}`} result={result} />
                            ))}
                        </ul>
                    )
                    : <ScreenP className="mt-4">Nothing found.</ScreenP>)
                : recent.length > 0 && (
                    <>
                        <ScreenH2 className="mt-4 text-left">Recent batches</ScreenH2>
                        <ul className={TILE_GRID}>
                            {recent.map(result => (
                                <EverywhereSearchItem key={`${result.kind}:${result.id}`} result={result} />
                            ))}
                        </ul>
                    </>
                )}
        </div>
    );
}
