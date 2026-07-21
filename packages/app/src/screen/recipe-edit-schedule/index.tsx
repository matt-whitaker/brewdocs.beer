import {KbRecipe} from "@brewdocs.beer/kb";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import {useRecipe} from "@/state/recipes";
import RecipeEditMash from "@/screen/recipe-edit-schedule/mash";
import RecipeEditBoil from "@/screen/recipe-edit-schedule/boil";
import RecipeEditEquipment from "@/screen/recipe-edit-schedule/equipment";

export type RecipeEditScheduleProps = { recipeId: string; onChange: (recipe: KbRecipe) => void };
export default function RecipeEditSchedule({ recipeId, onChange }: RecipeEditScheduleProps) {
    const recipe = useRecipe(recipeId);
    const [data, update, updateScalar, add, remove] = useJsonEdit<KbRecipe>(recipe, onChange);

    return (
        <Screen>
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
        </Screen>
    )
}
