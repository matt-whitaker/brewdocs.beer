import {KbRecipe, KbRecipeTemplate} from "@brewdocs.beer/kb";
import defaultRecipe from "@/data/defaultRecipe";
import Recipe from "@/model/recipe";
import {saveRecipe} from "@/state/recipes";
import recipesStorage from "@/storage/recipes";
import {kbBrewableToBrewable} from "@/transform/kbBrewableToBrewable";
import {kbRecipeToRecipe} from "@/transform/kbRecipeToRecipe";
import {cloneDeep} from "@/utils/func";

export default async function createRecipe(source?: KbRecipe, name?: string, template?: KbRecipeTemplate): Promise<string> {
    const id = await recipesStorage.generateId();

    let recipe: Recipe;
    if (source) {
        recipe = {...kbRecipeToRecipe(source), id};
    } else if (template) {
        recipe = {...cloneDeep(defaultRecipe), id, brewable: kbBrewableToBrewable(template.brewable)};
    } else {
        recipe = {...cloneDeep(defaultRecipe), id};
    }

    // let a caller (re)name the clone — e.g. "Edit" clones a catalog recipe into
    // a local one under a user-chosen name
    if (name) {
        recipe.name = name;
    }

    await saveRecipe(id, recipe);

    return id;
}
