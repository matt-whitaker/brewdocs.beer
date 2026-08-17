import {useState} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import SearchBar from "@/component/search-bar";
import EverywhereSearchItem from "@/screen/everywhere-search/item";
import {useSearchEverywhere} from "@/state/search";

export default function EverywhereSearch() {
    const [query, setQuery] = useState("");
    const results = useSearchEverywhere(query);
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
            {searched && (results.length > 0
                ? (
                    <ul className="mt-4 flex flex-col gap-2">
                        {results.map(result => (
                            <EverywhereSearchItem key={`${result.kind}:${result.id}`} result={result} />
                        ))}
                    </ul>
                )
                : <ScreenP className="mt-4">Nothing found.</ScreenP>)}
        </div>
    );
}
