import Recipe from "@/model/recipe";
import RecipeService from "@/service/recipe";
import State from "@/state/state";

export class RecipesState extends State<Recipe[]>{
    load() {
        RecipeService.list()
            .then(recipes => {
                this._subject.next(recipes);
            });
    }

    update(recipes: Recipe[]) {
        // console.log("RecipesState updating with", recipes);
        this._subject.next(recipes);
    }
}

const recipesState = new RecipesState();
export default recipesState;