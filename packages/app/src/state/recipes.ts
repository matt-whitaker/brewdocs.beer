import {useQuery, useSuspenseQuery} from "@tanstack/react-query";
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

export const useSuspenseRecipes = (): Recipe[] => {
    const { data } = useSuspenseQuery({
        queryKey: recipesQueryKey,
        queryFn: fetchRecipes
    });

    if (!data) {
        throw new Error("Unable to load recipes")
    }

    return data;
};

export const useRecipe = (id: string | null = null): Recipe|null => {
    const {data} = useQuery({queryKey: recipesQueryKey, queryFn: fetchRecipes });
    return data?.find(recipe => recipe.id === id) ?? null;
};

export const useSuspenseRecipe = (id: string | null = null): Recipe => {
    const {data} = useSuspenseQuery({queryKey: recipesQueryKey, queryFn: fetchRecipes });
    const recipe = data?.find(recipe => recipe.id === id);
    if (!data || !recipe) {
        throw new Error("Unable to load recipe")
    }
    return recipe;
};