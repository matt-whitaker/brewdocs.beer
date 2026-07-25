import {useSuspenseQuery} from "@tanstack/react-query";
import {defaultBrewable} from "@/model/brewable";
import Recipe from "@/model/recipe";
import queryClient from "@/queryClient";
import recipesStorage from "@/storage/recipes";
import {FilterFn} from "@/utils/func";

// migration-on-load isn't wired yet (see CLAUDE.md), so a recipe stored
// before `brewable` existed would otherwise reach the pilot without one.
const ensureBrewable = (recipe: Recipe): Recipe =>
    recipe.brewable ? recipe : {...recipe, brewable: defaultBrewable()};

export const recipesQueryKey = () => ["recipes"];
export const fetchRecipes = async () => (await recipesStorage.list()).map(ensureBrewable);

export const recipeQueryKey = (id: string): [string, string] => ["recipe", id];
export const fetchRecipe = async (id: string) => {
    const recipe = await recipesStorage.get(id);
    return recipe ? ensureBrewable(recipe) : recipe;
};
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
