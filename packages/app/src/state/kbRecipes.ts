import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import queryClient from "@/queryClient";
import kbStorage from "@/storage/kb";
import {isOnline} from "@/utils/connectivity";
import {FilterFn} from "@/utils/func";

const kbRecipesQueryKey = () => ["kb", "recipes"];

/**
 * The local kb cache is unversioned, so a cache written before `brewable` was
 * added to the recipe shape (KB model v2) is stale — the app can no longer
 * narrow it, and the "Edit" clone crashes on `kbRecipe.brewable`. Treat a
 * cached recipe missing `brewable` as stale so we re-hydrate from HTTP instead
 * of serving (and copying) a shape we can't read.
 */
const isStaleCache = (recipes: KbRecipe[]): boolean => recipes.some((recipe) => !recipe.brewable);

export const fetchKbRecipes = async (): Promise<KbRecipe[]> => {
    const cached = await kbStorage.getResource("recipes");
    if (cached && !isStaleCache(cached)) {
        return cached;
    }

    if (!isOnline()) {
        // best effort offline — no fresher source than what we already have
        if (cached) {
            return cached;
        }
        throw new Error("Recipe data isn't downloaded yet, and you're offline.");
    }

    const kbRecipes = await importResource("recipes");
    return kbStorage.saveResource("recipes", kbRecipes);
};

export const fetchKbRecipe = async (id: string): Promise<KbRecipe> => {
    const recipes = await fetchKbRecipes();
    const recipe = recipes.find((recipe) => recipe.id === id);

    if (!recipe) {
        throw new Error(`Unable to load recipe from Knowledge Base: ${id}`);
    }

    return recipe;
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
 * issuing its own fetch of the same resource. No call site today — kept
 * deliberately for future use, not dead code.
 */
export const useKbRecipe = (id: string): KbRecipe => {
    const { data } = useSuspenseQuery({ queryKey: kbRecipesQueryKey(), queryFn: fetchKbRecipes });
    const recipe = data?.find(recipe => recipe.id === id);

    if (!recipe) {
        throw new Error("Unable to load recipe from Knowledge Base");
    }

    return recipe;
};
