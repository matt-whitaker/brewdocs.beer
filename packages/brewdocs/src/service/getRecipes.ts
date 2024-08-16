import Recipe from "@brewdocs/model/recipe";
import recipes from "@brewdocs/data/recipes";

export default async function getRecipes(): Promise<Recipe[]> {
    return recipes;
}