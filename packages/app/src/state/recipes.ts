import {useQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";

export const recipesQueryKey = ["recipes"] as const;

export function kbRecipeToRecipe(kbRecipe: KbRecipe): Recipe {
    return kbRecipe as Recipe;
}

export const useRecipes = () => useQuery({
    queryKey: recipesQueryKey,
    queryFn: () => importResource<KbRecipe>("recipes")
}).data?.map(kbRecipeToRecipe);
