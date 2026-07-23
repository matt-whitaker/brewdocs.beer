import {useSuspenseQuery} from "@tanstack/react-query";
import Recipe from "@/model/recipe";
import queryClient from "@/queryClient";
import recipesStorage from "@/storage/recipes";
import {FilterFn} from "@/utils/func";

export const recipesQueryKey = () => ["recipes"];
export const loadRecipes = () => recipesStorage.list();

export const recipeQueryKey = (id: string): [string, string] => ["recipe", id];
export const loadRecipe = ({ queryKey: [, id]}: { queryKey: [string, string]}) => recipesStorage.get(id);

export const useRecipes = (filter?: FilterFn<Recipe>): Recipe[] => {
    const {data} = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: loadRecipes });

    if (!data) {
        throw new Error("Unable to load recipes");
    }

    return filter ? data.filter(filter) : data;
};

export const useRecipe = (id: string): Recipe => {
    const { data } = useSuspenseQuery({ queryKey: recipeQueryKey(id), queryFn: loadRecipe });

    if (!data) {
        throw new Error("Unable to load recipe");
    }

    return data;
};

export const saveRecipe = async (id: string, recipe: Recipe) => {
    await recipesStorage.save(id, recipe);
    await queryClient.invalidateQueries({queryKey: recipeQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: recipesQueryKey()});
};
