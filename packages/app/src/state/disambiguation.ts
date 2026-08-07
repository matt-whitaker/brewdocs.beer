import {useSuspenseQuery} from "@tanstack/react-query";
import {KbRecipe} from "@brewdocs.beer/kb/src";
import Recipe, {RecipeSource} from "@/model/recipe";
import queryClient from "@/queryClient";
import {useBatch} from "@/state/batches";
import {fetchKbRecipe} from "@/state/kbRecipes";
import {fetchRecipe} from "@/state/recipes";

type RecipeResourceQueryKey = [RecipeSource, string, string];

export const recipeResourceQueryKey = (source: RecipeSource, id: string): RecipeResourceQueryKey =>
    [source, "recipe", id];

export const loadRecipeResource = async ({queryKey: [source, , id]}: {queryKey: RecipeResourceQueryKey}) =>
    source === "kb" ? await fetchKbRecipe(id) : await fetchRecipe(id);

export const findRecipeResource = (source: RecipeSource, id: string) =>
    queryClient.ensureQueryData({queryKey: recipeResourceQueryKey(source, id), queryFn: loadRecipeResource});

export const useRecipeResource = (source: RecipeSource, id: string): Recipe | KbRecipe => {
    const {data} = useSuspenseQuery({
        queryKey: recipeResourceQueryKey(source, id),
        queryFn: loadRecipeResource,
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