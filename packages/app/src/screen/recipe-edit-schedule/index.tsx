import {useCallback} from "react";
import useJsonEdit from "@/hooks/useJsonEdit";
import Recipe from "@/model/recipe";
import RecipeEditBoil from "@/screen/recipe-edit-schedule/boil";
import RecipeEditEquipment from "@/screen/recipe-edit-schedule/equipment";
import RecipeEditMash from "@/screen/recipe-edit-schedule/mash";
import {saveRecipe, useRecipe} from "@/state/recipes";
import Screen from "@/component/screen";

export type RecipeEditScheduleProps = { recipeId: string };
export default function RecipeEditSchedule({ recipeId }: RecipeEditScheduleProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, updateScalar, add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    return (
        <Screen>
            <RecipeEditMash
                mash={data.mash}
                add={add}
                remove={remove}
                update={update}
                updateScalar={updateScalar}
            />
            <RecipeEditBoil
                boil={data.boil}
                add={add}
                remove={remove}
                update={update}
                updateScalar={updateScalar}
            />
            <RecipeEditEquipment
                equipment={data.equipment}
                add={add}
                remove={remove}
                update={update}
            />
        </Screen>
    );
}
