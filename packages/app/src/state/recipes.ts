import Recipe from "@/model/recipe";
import State from "@/state/state";
import useObservableState from "@/state/useObservableState";

export type RecipesTuple = [Recipe[], Map<string, Recipe>]|[null, null];
export const useRecipes = () => useObservableState<RecipesTuple, [null, null]>(recipesState, [null, null]);

export class RecipesState extends State<RecipesTuple, [null, null]>{
    load() {
        import("@/data/recipes").then(({ default: recipes }) => recipes)
            .then(recipes => {
                const index = recipes.reduce((m, r) => m.set(r.id, r), new Map());
                this._subject.next([recipes, index]);
            });
    }

    update(recipe: Recipe) {
    }
}

const recipesState = new RecipesState([null, null]);
export default recipesState;