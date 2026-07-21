import {ScreenH1} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import {useRecipe} from "@/state/recipes";
import {useCallback} from "react";
import RecipeEditMash from "@/screen/recipe-edit/mash";
import RecipeEditBoil from "@/screen/recipe-edit/boil";
import RecipeEditEquipment from "@/screen/recipe-edit/equipment";

export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);
    // There's no writable recipes store yet, so onChange is a no-op: the
    // draft only ever lives in useJsonEdit's local state and is discarded
    // on navigate. This is intentional, not an oversight.
    const onChange = useCallback(() => {}, []);
    const [data, update, updateScalar,, add, remove] = useJsonEdit<KbRecipe>(recipe, onChange);

    return (
        <Screen>
            <ScreenH1>{data.name}</ScreenH1>
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
