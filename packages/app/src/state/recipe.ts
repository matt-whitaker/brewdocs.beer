import {useQuery} from "@tanstack/react-query";
import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import {kbRecipeToRecipe, recipesQueryKey} from "@/state/recipes";

/**
 * Shares the "recipes" query cache with useRecipes() rather than issuing
 * its own fetch of the same kb resource
 */
export const useRecipe = (id: string|null = null) => {
    const {data} = useQuery({
        queryKey: recipesQueryKey,
        queryFn: () => importResource<KbRecipe>("recipes")
    });
    const kbRecipe = data?.find(recipe => recipe.id === id);
    return kbRecipe ? kbRecipeToRecipe(kbRecipe) : null;
};
