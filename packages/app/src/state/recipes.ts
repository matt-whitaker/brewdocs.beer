import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";
import {FilterFn} from "@/utils/func";

export const kbRecipeToRecipe = (kbRecipe: KbRecipe): Recipe => kbRecipe as Recipe;

const recipesQueryKey = () => ["recipes"] as const;
const fetchRecipes = async (): Promise<Recipe[]> => {
    const kbRecipes = await importResource("recipes");
    return kbRecipes.map(kbRecipeToRecipe);
}

const recipeQueryKey = (id) => ["recipe", id];
const fetchRecipe = async ({ queryKey: [, id] }): Promise<Recipe> => {
    const kbRecipes = await importResource("recipes");
    return kbRecipes.map(kbRecipeToRecipe).find(recipe => recipe.id === id);
}


export const useRecipes = (filter: FilterFn<Recipe>): Recipe[] => {
    const { data } = useSuspenseQuery({ queryKey: recipesQueryKey(), queryFn: fetchRecipes });

    if (!data) {
        throw new Error("Unable to load recipes")
    }

    return filter ? data.filter(filter) : data;
};

export const useSuspenseRecipe = (id: string): Recipe => {
    const {data} = useSuspenseQuery({queryKey: recipeQueryKey(id), queryFn: fetchRecipe });

    if (!data) {
        throw new Error("Unable to load recipe")
    }
    return data;
};