import {KbRecipe} from "@brewdocs.beer/kb";
import defaultRecipe from "@/data/defaultRecipe";
import Recipe from "@/model/recipe";
import {saveRecipe} from "@/state/recipes";
import recipesStorage from "@/storage/recipes";
import {kbRecipeToRecipe} from "@/transform/kbRecipeToRecipe";
import {cloneDeep} from "@/utils/func";

export default async function createRecipe(source?: KbRecipe): Promise<string> {
    const id = await recipesStorage.generateId();

    const recipe: Recipe = source
        ? {...kbRecipeToRecipe(source), id}
        : {...cloneDeep(defaultRecipe), id};

    await saveRecipe(id, recipe);

    return id;
}
