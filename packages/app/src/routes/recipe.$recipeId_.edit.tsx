import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Recipe from "@/model/recipe";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import RecipeEditIngredients from "@/screen/recipe-edit-ingredients";
import RecipeEditSchedule from "@/screen/recipe-edit-schedule";
import {saveRecipe} from "@/state/recipes";

export const Route = createFileRoute("/recipe/$recipeId_/edit")({
    component: RecipeEditPage
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();
    // persistence is out of scope for the recipe-edit prototype — no recipes store
    // exists yet, so edits live only in the draft and this is intentionally a no-op
    const onChange = useCallback((r: Recipe) => saveRecipe(recipeId, r), [recipeId]);

    return (
        <PanelSwitcher name="recipe.edit" defaultTab="Details">
            <PanelSwitcherContent title="Details">
                <RecipeEditDetails recipeId={recipeId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Ingredients">
                <RecipeEditIngredients recipeId={recipeId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Schedule">
                <RecipeEditSchedule recipeId={recipeId} onChange={onChange} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
