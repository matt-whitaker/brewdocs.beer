import {useSuspenseQuery} from "@tanstack/react-query";
import Recipe from "@/model/recipe";
import queryClient from "@/queryClient";
import recipesStorage from "@/storage/recipes";
import {FilterFn} from "@/utils/func";

const localRecipesQueryKey = () => ["recipe-local"];
const loadLocalRecipes = () => recipesStorage.list();

const localRecipeQueryKey = (id: string): [string, string] => ["recipe-local", id];
const loadLocalRecipe = ({ queryKey: [, id]}: { queryKey: [string, string]}) => recipesStorage.get(id);

export const useLocalRecipes = (filter?: FilterFn<Recipe>): Recipe[] => {
    const {data} = useSuspenseQuery({ queryKey: localRecipesQueryKey(), queryFn: loadLocalRecipes });

    if (!data) {
        throw new Error("Unable to load recipes");
    }

    return filter ? data.filter(filter) : data;
};

export const useLocalRecipe = (id: string): Recipe => {
    const { data } = useSuspenseQuery({ queryKey: localRecipeQueryKey(id), queryFn: loadLocalRecipe });

    if (!data) {
        throw new Error("Unable to load recipe");
    }

    return data;
};

export const saveRecipe = async (id: string, recipe: Recipe) => {
    await recipesStorage.save(id, recipe);
    await queryClient.invalidateQueries({queryKey: localRecipeQueryKey(id)});
    await queryClient.invalidateQueries({queryKey: localRecipesQueryKey()});
};
