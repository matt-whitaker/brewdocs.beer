import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";
import {FilterFn} from "@/utils/func";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import queryClient from "@/queryClient";

export const kbRecipeToRecipe = (kbRecipe: KbRecipe): Recipe => kbRecipe as Recipe;

const recipesQueryKey = () => ["recipes"];
const fetchRecipes = async (): Promise<Recipe[]> => {
    const cached = await kbStorage.getResource("recipes");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Recipe data isn't downloaded yet, and you're offline.");
    }

    const recipes = (await importResource("recipes")).map(kbRecipeToRecipe);
    return kbStorage.saveResource("recipes", recipes);
}

export const prefetchRecipes = () => queryClient.prefetchQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

export const useRecipes = (filter?: FilterFn<Recipe>): Recipe[] => {
    const { data } = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

    if (!data) {
        throw new Error("Unable to load recipes")
    }

    return filter ? data.filter(filter) : data;
};

/**
 * Shares the "recipes" query/cache entry with useRecipes() rather than
 * issuing its own fetch of the same resource
 */
export const useSuspenseRecipe = (id: string): Recipe => {
    const { data } = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });
    const recipe = data?.find(recipe => recipe.id === id);

    if (!recipe) {
        throw new Error("Unable to load recipe from Knowledge Base")
    }

    return recipe;
};
