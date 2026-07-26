import {createFileRoute} from "@tanstack/react-router";
import {useMemo} from "react";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeEdit from "@/screen/recipe-edit";
import {useRecipeResource} from "@/state/disambiguation";

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

    // Single-tab outer switcher (not compact) so the edit page carries a real page
    // tab bar like the batch page; the batch-planning-style header + compact sub-tabs
    // live inside RecipeEdit.
    return (
        <PanelSwitcher name="recipe.edit.page" defaultTab="Planning">
            <PanelSwitcherContent title="Planning">
                <RecipeEdit recipeId={recipeId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
