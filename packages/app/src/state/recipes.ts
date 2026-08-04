import {useMutation, useSuspenseQuery} from "@tanstack/react-query";
import {useCallback} from "react";
import Recipe from "@/model/recipe";
import queryClient from "@/queryClient";
import recipesStorage from "@/storage/recipes";
import {FilterFn} from "@/utils/func";

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

export const recipeMutationScope = (id: string) => ({id: `recipe:${id}`});

export type PatchRecipeFn = (patch: Partial<Recipe>) => void;

export const usePatchRecipe = (id: string): PatchRecipeFn => {
    const {mutate} = useMutation({
        scope: recipeMutationScope(id),
        mutationFn: async (patch: Partial<Recipe>) => {
            const current = await recipesStorage.get(id);
            if (!current) return;
            await recipesStorage.save(id, {...current, ...patch});
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({queryKey: recipeQueryKey(id)});
            await queryClient.invalidateQueries({queryKey: recipesQueryKey()});
        }
    });

    return useCallback((patch: Partial<Recipe>) => mutate(patch), [mutate]);
};
