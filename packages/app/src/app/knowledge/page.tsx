"use client";

import SearchEverywhere from "@/screen/search-everywhere";
import {FEATURES_SEARCH_EVERYWHERE} from "@/utils/env";
import {useBatches} from "@/state/batches";

export default function KnowledgePage() {
    const [batches] = useBatches();

    if (!batches) {
        return null;
    }

    if (FEATURES_SEARCH_EVERYWHERE) {
        return <SearchEverywhere batches={batches} />;
    }

    return <p>Page not implemented</p>;
}