import {useSuspenseQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";

export const recipesQueryKey = ["recipes"] as const;

export const kbRecipeToRecipe = (kbRecipe: KbRecipe): Recipe => kbRecipe as Recipe;

export const fetchRecipes = async (): Promise<Recipe[]> => {
    const kbRecipes = await importResource<KbRecipe>("recipes");
    return kbRecipes.map(kbRecipeToRecipe);
}

export const useSuspenseRecipes = (): Recipe[] => {
    const { data } = useSuspenseQuery({
        queryKey: recipesQueryKey,
        queryFn: fetchRecipes
    });

    if (!data) {
        throw new Error("Unable to load recipes")
    }

    return data;
};

export const useSuspenseRecipe = (id: string): Recipe => {
    const {data} = useSuspenseQuery({queryKey: recipesQueryKey, queryFn: fetchRecipes });
    const recipe = data?.find(recipe => recipe.id === id);
    if (!data || !recipe) {
        throw new Error("Unable to load recipe")
    }
    return recipe;
};