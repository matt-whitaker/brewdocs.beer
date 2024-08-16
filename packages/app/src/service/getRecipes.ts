import Recipe from "@/model/recipe";
import recipes from "@/data/recipes";

export default async function getRecipes(): Promise<Recipe[]> {
    return recipes;
}