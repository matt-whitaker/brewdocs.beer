import {createFileRoute} from "@tanstack/react-router";
import Batch from "@/model/batch";
import SearchEverywhere from "@/screen/search-everywhere";
import {FEATURES_SEARCH_EVERYWHERE} from "@/utils/env";

export const Route = createFileRoute("/knowledge")({
    component: KnowledgePage
});

function KnowledgePage() {
    const batches = [] as Batch[];

    if (!batches) {
        return null;
    }

    if (FEATURES_SEARCH_EVERYWHERE) {
        return <SearchEverywhere batches={batches} />;
    }

    return <p>Page not implemented</p>;
}
