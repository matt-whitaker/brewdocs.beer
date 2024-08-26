import Recipe from "@/model/recipe";
import {Service} from "@/service/useService";
import recipes from "@/data/recipes";
import {BehaviorSubject, Subject} from "rxjs";

export class RecipeService implements Service<Recipe> {
    private _$ubject;
    private $ubject = new Subject<Recipe>();

    private $update(recipe: Recipe) {
        if (!this._$ubject) {
            this._$ubject = new BehaviorSubject<Recipe>(recipe);
            this._$ubject.subscribe(this.$ubject);
        } else {
            this._$ubject.next(recipe);
        }
    }

    subscribe(subscriber: (recipe: Recipe) => void) {
        this.$ubject.subscribe(subscriber);
    };

    async get(recipeId: string): Promise<Recipe|null> {
        return recipes.find(({ id }: Recipe) => id === recipeId) ?? null;
    }

    async list(): Promise<Recipe[]> {
        return recipes;
    }
}

export default new RecipeService();