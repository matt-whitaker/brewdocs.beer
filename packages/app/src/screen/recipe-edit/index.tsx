import {useCallback, useRef} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import Brewable from "@/model/brewable";
import BrewableEdit from "@/screen/brewable-edit";
import RecipeEditDetails from "@/screen/recipe-edit/details";
import {saveRecipe, useRecipe} from "@/state/recipes";

// A name/brewer header, then BrewableEdit for the Ingredients/Equipment/Phases
// tabs. The recipe-specific "Details" panel is injected as panelsBefore, so this
// screen owns only the recipe chrome — BrewableEdit owns the brewable editing.
export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);

    // merge into the freshest resource at save time — a sibling panel (the
    // Details panel below) may have changed other fields since
    const recipeRef = useRef(recipe);
    recipeRef.current = recipe;
    const onChangeBrewable = useCallback((brewable: Brewable) => saveRecipe(recipeId, {...recipeRef.current, brewable}), [recipeId]);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH3>{recipe.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
            </div>
            <BrewableEdit
                brewable={recipe.brewable}
                onChangeBrewable={onChangeBrewable}
                name="recipe.edit"
                defaultTab="Details"
                panelsBefore={
                    <PanelSwitcherContent title="Details">
                        <RecipeEditDetails recipeId={recipeId} />
                    </PanelSwitcherContent>
                }
            />
        </Screen>
    );
}
