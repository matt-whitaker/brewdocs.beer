import SearchEverywhere from "@/screen/search-everywhere";
import {FEATURES_SEARCH_EVERYWHERE} from "@/utils/env";

export default function Knowledge() {
    if (FEATURES_SEARCH_EVERYWHERE) {
        return <SearchEverywhere />;
    }

    return <p>Page not implemented</p>;
}