import Recipe from "@/model/recipe";
import {Forage} from "@/storage/forage";
import {LF_INDEXEDDB} from "@/storage/localforage";

export const RECIPES_ENTITY_TYPE = "recipes";
export const RECIPES_VERSION = 1;

export class RecipesStorage extends Forage<Recipe> {
    constructor() {
        super(RECIPES_ENTITY_TYPE, LF_INDEXEDDB, {
            entityType: RECIPES_ENTITY_TYPE,
            version: RECIPES_VERSION,
            migrations: [],
        });
    }
}

const recipesStorage = new RecipesStorage();
export default recipesStorage;
