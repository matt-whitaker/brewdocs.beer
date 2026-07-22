import Recipe from "@/model/recipe";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";

export class RecipesStorage extends Forage<Recipe> {
    constructor() {
        super("recipes", LF_INDEXEDDB);
    }
}

const recipesStorage = new RecipesStorage();
export default recipesStorage;
