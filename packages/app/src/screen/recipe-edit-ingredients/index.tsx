import {useCallback} from "react";
import useJsonEdit from "@/hooks/useJsonEdit";
import Recipe from "@/model/recipe";
import RecipeEditAdditives from "@/screen/recipe-edit-ingredients/additives";
import RecipeEditGrains from "@/screen/recipe-edit-ingredients/grains";
import RecipeEditHops from "@/screen/recipe-edit-ingredients/hops";
import RecipeEditYeasts from "@/screen/recipe-edit-ingredients/yeasts";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type RecipeEditIngredientsProps = {
    recipeId: string;
};
export default function RecipeEditIngredients({ recipeId }: RecipeEditIngredientsProps) {
    const recipe = useRecipe(recipeId);
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);
    const [data, update, updateScalar, toggle, add, remove] = useJsonEdit<Recipe>(recipe, onChange);

    return (
        <Screen>
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
        </Screen>
    );
}