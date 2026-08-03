import {useSuspenseQuery} from "@tanstack/react-query";
import Recipe from "@/model/recipe";
import queryClient from "@/queryClient";
import recipesStorage from "@/storage/recipes";
import {FilterFn} from "@/utils/func";
import serialize from "@/utils/serialize";

export const recipesQueryKey = () => ["recipes"];
export const fetchRecipes = async () => recipesStorage.list();

export const recipeQueryKey = (id: string): [string, string] => ["recipe", id];
export const fetchRecipe = async (id: string) => recipesStorage.get(id);
export const queryRecipe = ({ queryKey: [, id]}: { queryKey: [string, string]}) => fetchRecipe(id);

export const useRecipes = (filter?: FilterFn<Recipe>): Recipe[] => {
    const {data} = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

    if (!data) {
        throw new Error("Unable to load recipes");
    }

    return filter ? data.filter(filter) : data;
};

export const useRecipe = (id: string): Recipe => {
    const { data } = useSuspenseQuery({ queryKey: recipeQueryKey(id), queryFn: queryRecipe });

    if (!data) {
        throw new Error("Unable to load recipe");
    }

    return data;
};

export const saveRecipe = async (id: string, recipe: Recipe) => {
    // the brewable is the source of truth; no legacy arrays to project anymore
    await recipesStorage.save(id, recipe);
    await queryClient.invalidateQueries({queryKey: recipeQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: recipesQueryKey()});
};

export const deleteRecipe = async (id: string) => {
    await recipesStorage.delete(id);
    await queryClient.invalidateQueries({queryKey: recipeQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: recipesQueryKey()});
};

// Merge a slice onto the freshest stored recipe — for a screen that owns only
// part of the recipe (recipe-edit's brewable, the Details panel's other fields).
// Doing the merge here, against the current stored value, means a sibling panel
// editing a different slice can't clobber this one, and the caller needn't hold
// a ref to the whole recipe to reconstruct it.
export const patchRecipe = (id: string, patch: Partial<Recipe>) => serialize(`recipe:${id}`, async () => {
    const current = await recipesStorage.get(id);
    if (!current) return;
    await recipesStorage.save(id, {...current, ...patch});
    await queryClient.invalidateQueries({queryKey: recipeQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: recipesQueryKey()});
});
