import {useCallback, useMemo, useState} from "react";
import {CardGrid} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import SearchBar from "@/component/search-bar";
import useIndexBy from "@/hooks/useIndexBy";
import Batch from "@/model/batch";
import BatchListItem from "@/screen/batch-list/item";
import {useBatches} from "@/state/batches";
import {useKbRecipes} from "@/state/kbRecipes";
import {useRecipes} from "@/state/recipes";

export type BatchListProps = { filter?: (b: Batch) => boolean };
export default function BatchList({ filter }: BatchListProps) {
    const batches = useBatches(filter);
    const recipesIndex = useIndexBy(useRecipes())!;
    const kbRecipesIndex = useIndexBy(useKbRecipes())!;
    const [query, setQuery] = useState("");

    const recipeFor = useCallback((batch: Batch) =>
        (batch.recipeSource === "user" ? recipesIndex : kbRecipesIndex).get(batch.recipeId),
    [recipesIndex, kbRecipesIndex]);

    const recipeNameFor = useCallback((batch: Batch) =>
        batch.recipeName || recipeFor(batch)?.name || "",
    [recipeFor]);

    const shownBatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return batches;
        return batches.filter((batch) =>
            batch.name.toLowerCase().includes(q)
            || recipeNameFor(batch).toLowerCase().includes(q));
    }, [batches, recipeNameFor, query]);

    const batchList = useMemo(() => shownBatches.map((batch) => (
        <BatchListItem
            key={batch.id}
            batch={batch}
            recipeName={recipeNameFor(batch)}
            brewer={batch.brewer || batch.recipeBrewer || recipeFor(batch)?.brewer || ""}
        />
    )), [shownBatches, recipeFor, recipeNameFor]);
    return (
        <Screen>
            <SearchBar value={query} onChange={setQuery} label="Search batches" />
            <CardGrid className="mt-2">
                {batchList}
            </CardGrid>
        </Screen>
    );
}