import {useState} from "react";
import {ScreenH2, ScreenP} from "@brewdocs.beer/design";
import SearchBar from "@/component/search-bar";
import EverywhereSearchItem from "@/screen/everywhere-search/item";
import {useRecentBatches, useSearchEverywhere} from "@/state/search";

const PAGE = "w-[calc(100vw-2rem)] lg:w-[calc(100vw-24rem)] lg:max-w-3xl"
    + " min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-2rem)]";

const TILE_GRID = "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4";

export default function EverywhereSearch() {
    const [query, setQuery] = useState("");
    const results = useSearchEverywhere(query);
    const recent = useRecentBatches();
    const searched = query.trim().length > 0;

    return (
        <div className={PAGE}>
            <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="What are you looking for?"
            />
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
