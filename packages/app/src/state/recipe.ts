import EntityState from "@/state/entityState";

import useEntityState from "@/hooks/useEntityState";
import Recipe from "@/model/recipe";


export const useRecipe = (id: string|null) => useEntityState<Recipe>(recipeState, id);

export class RecipeState extends EntityState<Recipe> {
    load(id: string) {
        import("@/data/recipes").then(({ default: recipes }) => recipes)
            .then(recipes => {
                const recipe = recipes.reduce((m, r) => m.set(r.id, r), new Map()).get(id);
                this._subject.next(recipe ?? null);
            });
    }
}

const recipeState = new RecipeState(null);
export default recipeState;