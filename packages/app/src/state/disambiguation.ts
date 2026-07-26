import {useSuspenseQuery} from "@tanstack/react-query";
import {KbRecipe} from "@brewdocs.beer/kb/src";
import Recipe from "@/model/recipe";
import {useBatch} from "@/state/batches";
import {fetchKbRecipe} from "@/state/kbRecipes";
import {fetchRecipe} from "@/state/recipes";

export const useRecipeResource = (source: RecipeSource, id: string): Recipe | KbRecipe => {
    const {data} = useSuspenseQuery({
        queryKey: [source, "recipe", id],
        queryFn: async () => {
            if (source === "kb") {
                return await fetchKbRecipe(id);
            }
            return await fetchRecipe(id);
        },
    });

    if (!data) {
        throw new Error(`Unable to load ${source} recipe: ${id}`);
    }

    return data;
};

export function useBatchRecipe(batchId: string) {
    const batch = useBatch(batchId);
    const source = batch.recipeSource ?? "kb";
    return {name: useRecipeResource(source, batch.recipeId).name, source, recipeId: batch.recipeId};
}