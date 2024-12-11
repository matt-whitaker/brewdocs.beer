import {importResource, KbRecipe} from "@brewdocs.beer/kb";
import Recipe from "@/model/recipe";
import useCollectionState from "@/hooks/useCollectionState";
import CollectionState from "@/state/collectionState";

export const useRecipes = () => useCollectionState<Recipe>(recipesState);

export class RecipesState extends CollectionState<Recipe>{
    async load() {
        const kbRecipes = await importResource<KbRecipe>("recipes");
        const recipes = kbRecipes?.map(kbRecipe => this.kbToState(kbRecipe)) ?? null;
        this._subject.next(recipes);
        return recipes;
    }

    kbToState(kbRecipe: KbRecipe): Recipe {
        return kbRecipe as Recipe;
    }
}

const recipesState = new RecipesState(null);
export default recipesState;