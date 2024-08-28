import Recipe from "@/model/recipe";
import recipes from "@/data/recipes";

export class RecipeService {
    async get(recipeId: string): Promise<Recipe|null> {
        return (await this.list()).find(({ id }: Recipe) => id === recipeId) ?? null;
    }

    async list(): Promise<Recipe[]> {
        return (await import("@/data/recipes")).default;
    }
}

const recipeService = new RecipeService();
export default recipeService;