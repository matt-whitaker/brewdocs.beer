import {useCallback} from "react";
import useJsonEdit from "@/hooks/useJsonEdit";
import Recipe from "@/model/recipe";
import RecipeEditBoil from "@/screen/recipe-edit-schedule/boil";
import RecipeEditEquipment from "@/screen/recipe-edit-schedule/equipment";
import RecipeEditMash from "@/screen/recipe-edit-schedule/mash";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type RecipeEditScheduleProps = { recipeId: string };
export default function RecipeEditSchedule({ recipeId }: RecipeEditScheduleProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, updateScalar, add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    return (
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <div>
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
            </div>
            <div>
                <RecipeEditEquipment
                    equipment={data.equipment}
                    add={add}
                    remove={remove}
                    update={update}
                />
            </div>
        </div>
    );
}
