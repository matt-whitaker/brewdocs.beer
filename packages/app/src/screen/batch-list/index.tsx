import {useCallback, useMemo, useState} from "react";
import Screen from "@/component/screen";
import SearchBar from "@/component/search-bar";
import useIndexBy from "@/hooks/useIndexBy";
import Batch from "@/model/batch";
import BatchListItem from "@/screen/batch-list/item";
import {deleteBatch, useBatches} from "@/state/batches";
import {useKbRecipes} from "@/state/kbRecipes";
import {useRecipes} from "@/state/recipes";

export type BatchListProps = { filter?: (b: Batch) => boolean };
export default function BatchList({ filter }: BatchListProps) {
    const batches = useBatches(filter);
    const recipesIndex = useIndexBy(useRecipes())!;
    const kbRecipesIndex = useIndexBy(useKbRecipes())!;
    const [query, setQuery] = useState("");

    // a batch's recipe lives in either store — resolve by its recipeSource
    // (absent on legacy batches, which were all catalog recipes → kb)
    const recipeFor = useCallback((batch: Batch) =>
        (batch.recipeSource === "user" ? recipesIndex : kbRecipesIndex).get(batch.recipeId),
    [recipesIndex, kbRecipesIndex]);

    const shownBatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return batches;
        return batches.filter((batch) =>
            batch.name.toLowerCase().includes(q)
            || recipeFor(batch)?.name.toLowerCase().includes(q));
    }, [batches, recipeFor, query]);

    const batchList = useMemo(() => shownBatches.map((batch) => (
        <BatchListItem
            key={batch.id}
            batch={batch}
            recipeName={recipeFor(batch)?.name || ""}
            brewer={batch.brewer || recipeFor(batch)?.brewer || ""}
            onDelete={() => deleteBatch(batch.id)}
        />
    )), [shownBatches, recipeFor]);
    return (
        <Screen>
            <SearchBar value={query} onChange={setQuery} label="Search batches" />
            <ul className="w-full menu px-0">
                {batchList}
            </ul>
        </Screen>
    );
}