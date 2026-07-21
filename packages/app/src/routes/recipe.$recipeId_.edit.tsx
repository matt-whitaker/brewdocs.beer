import {createFileRoute} from "@tanstack/react-router";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import PanelSwitcher from "@/component/panel-switcher";
import {useCallback} from "react";
import updateBatch from "@/actions/updateBatch";
import {KbRecipe} from "../../../kb";
import RecipeEditIngredients from "@/screen/recipe-edit-ingredients";
import RecipeEditSchedule from "@/screen/recipe-edit-schedule";

export const Route = createFileRoute("/recipe/$recipeId_/edit")({
    component: RecipeEditPage
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();
    const onChange = useCallback((recipe: KbRecipe) => {  }, []);

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
    )
}
