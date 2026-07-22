import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import {FilterFn} from "@/utils/func";

const recipesQueryKey = () => ["recipes"];
const fetchRecipes = async (): Promise<KbRecipe[]> => {
    const cached = await kbStorage.getResource("recipes");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Recipe data isn't downloaded yet, and you're offline.");
    }

    const recipes = await importResource("recipes");
    return kbStorage.saveResource("recipes", recipes);
};

export const prefetchRecipes = () => queryClient.prefetchQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

export const useRecipes = (filter?: FilterFn<KbRecipe>): KbRecipe[] => {
    const { data } = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

    if (!data) {
        throw new Error("Unable to load recipes");
    }

    return filter ? data.filter(filter) : data;
};

/**
 * Shares the "recipes" query/cache entry with useRecipes() rather than
 * issuing its own fetch of the same resource
 */
export const useRecipe = (id: string): KbRecipe => {
    const { data } = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });
    const recipe = data?.find(recipe => recipe.id === id);

    if (!recipe) {
        throw new Error("Unable to load recipe from Knowledge Base");
    }

    return recipe;
};
