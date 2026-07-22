import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import {FilterFn} from "@/utils/func";

const kbRecipesQueryKey = () => ["kb", "recipes"];
const fetchKbRecipes = async (): Promise<KbRecipe[]> => {
    const cached = await kbStorage.getResource("recipes");
    if (cached) {
        return cached;
    }

    if (!isOnline()) {
        throw new Error("Recipe data isn't downloaded yet, and you're offline.");
    }

    const kbRecipes = await importResource("recipes");
    return kbStorage.saveResource("recipes", kbRecipes);
};

export const prefetchKbRecipes = () => queryClient.prefetchQuery({ queryKey: kbRecipesQueryKey(), queryFn: fetchKbRecipes });

export const useKbRecipes = (filter?: FilterFn<KbRecipe>): KbRecipe[] => {
    const { data } = useSuspenseQuery({ queryKey: kbRecipesQueryKey(), queryFn: fetchKbRecipes });

    if (!data) {
        throw new Error("Unable to load kbRecipes");
    }

    return filter ? data.filter(filter) : data;
};

/**
 * Shares the "kbRecipes" query/cache entry with useRecipes() rather than
 * issuing its own fetch of the same resource
 */
export const useKbRecipe = (id: string): KbRecipe => {
    const { data } = useSuspenseQuery({ queryKey: kbRecipesQueryKey(), queryFn: fetchKbRecipes });
    const recipe = data?.find(recipe => recipe.id === id);

    if (!recipe) {
        throw new Error("Unable to load recipe from Knowledge Base");
    }

    return recipe;
};
