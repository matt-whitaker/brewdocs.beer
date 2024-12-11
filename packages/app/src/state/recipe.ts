import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import EntityState from "@/state/entityState";

import useEntityState from "@/hooks/useEntityState";
import Recipe from "@/model/recipe";
import recipesState from "@/state/recipes";


export const useRecipe = (id: string|null) => useEntityState<Recipe>(recipeState, id);

export class RecipeState extends EntityState<Recipe> {
    async load(id: string) {
        const recipes = await importResource<KbRecipe>("recipes");
        const kbRecipe = recipes?.find(recipe => recipe.id === id);
        const recipe = kbRecipe ? recipesState.kbToState(kbRecipe) : null;
        this._subject.next(recipe);
        return recipe;
    }
}

const recipeState = new RecipeState(null);
export default recipeState;