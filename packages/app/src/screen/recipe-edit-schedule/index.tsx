import {useCallback} from "react";
import useJsonEdit from "@/hooks/useJsonEdit";
import Recipe from "@/model/recipe";
import RecipeEditPhases from "@/screen/recipe-edit-schedule/phases";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type RecipeEditScheduleProps = { recipeId: string };
export default function RecipeEditSchedule({ recipeId }: RecipeEditScheduleProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    // saveRecipe projects brewable back onto the legacy mash/boil/equipment
    // arrays (_projectRecipeBrewable), so editing brewable here is enough to keep them in sync
    const [data, update, , , add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    return (
        <RecipeEditPhases
            phases={data.brewable.schedule.phases}
            add={add}
            remove={remove}
            update={update}
        />
    );
}
