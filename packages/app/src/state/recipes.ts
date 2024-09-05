import Recipe from "@/model/recipe";
import State from "@/state/state";
import {useEffect, useState} from "react";

export type RecipesTuple = [Recipe[], Map<string, Recipe>]|[null, null];

export function useRecipes(): RecipesTuple {
    const [state, setState] = useState<RecipesTuple>(recipesState.current || [null, null]);

    useEffect(() => {
        console.log("useEffect in useRecipes");
        recipesState.subscribe((newState) => setState(newState));
        recipesState.load();
    }, []);

    return state as RecipesTuple;
}

export class RecipesState extends State<RecipesTuple>{
    load() {
        import("@/data/recipes").then(({ default: recipes }) => recipes)
            .then(recipes => {
                const index = recipes.reduce((m, r) => m.set(r.id, r), new Map());
                this._subject.next([recipes, index]);
            });
    }

    update(batch: Recipe) {
        // do update

        // reload from storage
        this.load();
    }
}

const recipesState = new RecipesState([null, null]);
export default recipesState;