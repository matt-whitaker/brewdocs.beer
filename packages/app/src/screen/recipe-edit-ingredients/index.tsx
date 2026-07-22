import {KbRecipe} from "@brewdocs.beer/kb";
import Screen from "@/component/screen";
import useJsonEdit from "@/hooks/useJsonEdit";
import RecipeEditAdditives from "@/screen/recipe-edit-ingredients/additives";
import RecipeEditGrains from "@/screen/recipe-edit-ingredients/grains";
import RecipeEditHops from "@/screen/recipe-edit-ingredients/hops";
import RecipeEditYeasts from "@/screen/recipe-edit-ingredients/yeasts";
import {useKbRecipe} from "@/state/kbRecipes";

export type RecipeEditIngredientsProps = {
    recipeId: string;
    onChange: (recipe: KbRecipe) => void
};
export default function RecipeEditIngredients({ recipeId, onChange }: RecipeEditIngredientsProps) {
    const recipe = useKbRecipe(recipeId);
    const [data, update, updateScalar, toggle, add, remove] = useJsonEdit<KbRecipe>(recipe, onChange);
    return (
        <Screen>
            <div className="pt-2 grid grid-cols-1 lg:grid-cols-2 gap-x-4">
                <div>
                    <RecipeEditGrains
                        grains={data.grains}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                    <RecipeEditHops
                        hops={data.hops}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </div>
                <div>
                    <RecipeEditYeasts
                        yeasts={data.yeasts}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                        toggle={toggle}
                    />
                    <RecipeEditAdditives
                        additives={data.additives}
                        add={add}
                        remove={remove}
                        update={update}
                        updateScalar={updateScalar}
                    />
                </div>
            </div>
        </Screen>
    );
}