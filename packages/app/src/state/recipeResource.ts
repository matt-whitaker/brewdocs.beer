import {useSuspenseQuery} from "@tanstack/react-query";
import {KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";
import {fetchKbRecipe} from "@/state/kbRecipes";
import recipesStorage from "@/storage/recipes";

export type RecipeSource = "kb" | "user";

/**
 * One hook for either a catalog (KbRecipe) or a user Recipe, chosen by `source`.
 * A single useSuspenseQuery whose queryFn branches on the source, so a screen can
 * serve both without conditionally calling two hooks (hook rules). `kb` reads the
 * downloaded catalog (through kb storage's cache) and finds by id; `user` loads
 * the recipe straight from its own store.
 */
export const useRecipeResource = (source: RecipeSource, id: string): Recipe | KbRecipe => {
    const { data } = useSuspenseQuery({
        queryKey: [source, "recipe", id],
        queryFn: async () => {
            if (source === "kb") {
                return await fetchKbRecipe(id);
            }
            return recipesStorage.get(id);
        },
    });

    if (!data) {
        throw new Error(`Unable to load ${source} recipe: ${id}`);
    }

    return data;
};
