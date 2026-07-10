import {useQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";

export const recipesQueryKey = ["recipes"] as const;

function kbRecipeToRecipe(kbRecipe: KbRecipe): Recipe {
    return kbRecipe as Recipe;
}

export async function fetchRecipes(): Promise<Recipe[]|null> {
    const kbRecipes = await importResource<KbRecipe>("recipes");
    return kbRecipes?.map(kbRecipeToRecipe) ?? null;
}

export const useRecipes = (): Recipe[]|null => useQuery({
    queryKey: recipesQueryKey,
    queryFn: fetchRecipes
}).data ?? null;

/**
 * Shares the "recipes" query cache with useRecipes() rather than issuing
 * its own fetch of the same kb resource
 */
export const useRecipe = (id: string | null = null): Recipe|null => {
    const {data} = useQuery({queryKey: recipesQueryKey, queryFn: fetchRecipes});
    return data?.find(recipe => recipe.id === id) ?? null;
};