import SearchEverywhere from "@/screen/search-everywhere";
import {FEATURES_SEARCH_EVERYWHERE} from "@/utils/env";
import useSubject from "@/state/useSubject";
import Batch from "@/model/batch";
import {useMemo} from "react";
import BatchesState from "@/state/batches";

export default function Knowledge() {
    if (FEATURES_SEARCH_EVERYWHERE) {
        const batches = useSubject<Batch[], []>(useMemo(() => new BatchesState(), []), []);
        return <SearchEverywhere batches={batches} />;
    }

    return <p>Page not implemented</p>;
}