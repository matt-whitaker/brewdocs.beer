import {BehaviorSubject, Subject} from "rxjs";
import Recipe from "@/model/recipe";
import RecipeService from "@/service/recipe";

export default class RecipesState {
    private args: [];

    private $ubject: Subject<Recipe[]|null> = new Subject<Recipe[]|null>();
    private _$ubject?: BehaviorSubject<Recipe[]|null>;

    constructor() {
        this.args = [];
    }

    initialize() {
        RecipeService.list()
            .then(recipes => {
                if (!this._$ubject) {
                    this._$ubject = new BehaviorSubject<Recipe[]|null>(recipes!)
                    this._$ubject.subscribe(this.$ubject);
                }
            });
    }

    subscribe(fn: (recipes: Recipe[]|null) => void) {
        this.$ubject.subscribe(fn);
    }

    reload() {
        RecipeService.list()
            .then(recipes => {
                this._$ubject!.next(recipes);
            });
    }

    update(recipes: Recipe[]) {
        // console.log("RecipesState updating with", recipes);
    }
}