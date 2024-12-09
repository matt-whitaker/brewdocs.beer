import Recipe from "@/model/recipe";
import useCollectionState from "@/hooks/useCollectionState";
import CollectionState from "@/state/collectionState";

export const useRecipes = () => useCollectionState<Recipe>(recipesState);

export class RecipesState extends CollectionState<Recipe>{
    load() {
        import("@/data/recipes").then(({ default: recipes }) => recipes)
            .then(recipes => this._subject.next(recipes));
    }
}

const recipesState = new RecipesState(null);
export default recipesState;