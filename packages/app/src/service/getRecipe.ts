import getRecipes from "@/service/getRecipes";
import Recipe from "@/model/recipe";
import equipment from "@/data/equipment";
import getEquipment from "@/service/getEquipment";

export default async function getRecipe(recipeId: string): Promise<Recipe> {
    const recipe =  (await getRecipes()).find(({ id }) => id === `${recipeId}`);
    if (recipe) recipe.equipment = await getEquipment();

    return recipe;
}