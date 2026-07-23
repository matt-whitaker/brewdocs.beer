import {createFileRoute} from "@tanstack/react-router";
import {useMemo} from "react";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import RecipeEditIngredients from "@/screen/recipe-edit-ingredients";
import RecipeEditSchedule from "@/screen/recipe-edit-schedule";
import {useRecipeResource} from "@/state/recipeResource";

export const Route = createFileRoute("/recipe/$recipeId_/edit")({
    component: RecipeEditPage
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Recipes", to: "/recipes" },
        dynamicCrumb(useRecipeResource, ["user", recipeId], (recipe) => recipe.name, { to: "/recipe/$recipeId", params: {recipeId} }),
        { label: "Edit" },
    ], [recipeId]);
    useBreadcrumbs(breadcrumbs);

    return (
        <PanelSwitcher compact name="recipe.edit" defaultTab="Details">
            <PanelSwitcherContent title="Details">
                <RecipeEditDetails recipeId={recipeId} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Ingredients">
                <RecipeEditIngredients recipeId={recipeId} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Schedule">
                <RecipeEditSchedule recipeId={recipeId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
