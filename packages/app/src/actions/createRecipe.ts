import {KbRecipe, KbRecipeTemplate} from "@brewdocs.beer/kb";
import defaultRecipe from "@/data/defaultRecipe";
import Recipe from "@/model/recipe";
import {saveRecipe} from "@/state/recipes";
import recipesStorage from "@/storage/recipes";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";
import {kbRecipeToRecipe} from "@/transform/kbRecipeToRecipe";

export default async function createRecipe(source?: KbRecipe | KbRecipeTemplate, name?: string): Promise<string> {
    const id = await recipesStorage.generateId();

    let recipe: Recipe;
    if (!source) {
        recipe = {...defaultRecipe(), id};
    } else if (source.__type === "kbRecipeTemplate") {
        recipe = {...defaultRecipe(kbBrewableToBrewable(source.brewable)), id};
    } else {
        recipe = {...kbRecipeToRecipe(source), id};
    }

    if (name) {
        recipe.name = name;
    }

    await saveRecipe(id, recipe);

    return id;
}
