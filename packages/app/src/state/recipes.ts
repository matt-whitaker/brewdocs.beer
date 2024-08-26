import {BehaviorSubject, Subject} from "rxjs";
import Recipe from "@/model/recipe";
import RecipeService from "@/service/recipe";

export default class RecipesState {
    private args: [];

    private $ubject: Subject<Recipe[]> = new Subject<Recipe[]>();
    private _$ubject: BehaviorSubject<Recipe[]>;

    constructor() {
        this.args = [];
    }

    initialize() {
        RecipeService.list()
            .then(recipes => {
                if (!this._$ubject) {
                    this._$ubject = new BehaviorSubject(recipes!)
                    this._$ubject.subscribe(this.$ubject);
                }
            });
    }

    subscribe(fn: (recipes: Recipe[]) => void) {
        this.$ubject.subscribe(fn);
    }

    reload() {
        RecipeService.list()
            .then(recipes => {
                this._$ubject.next(recipes);
            });
    }
}