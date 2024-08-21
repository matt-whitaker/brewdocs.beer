import Recipe from "@/model/recipe";
import {Service} from "@/service/useService";
import recipes from "@/data/recipes";

export class RecipeService implements Service<Recipe> {
    async get(recipeId: string): Promise<Recipe> {
        return recipes.find(({ id }: Recipe) => id === recipeId);
    }

    async list(): Promise<Recipe[]> {
        return recipes;
    }
}

export default new RecipeService();