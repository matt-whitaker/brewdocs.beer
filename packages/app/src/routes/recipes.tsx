import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import createRecipe from "@/actions/createRecipe";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {Plus} from "@/component/svg";
import RecipeList from "@/screen/recipe-list";

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
    const navigate = useNavigate();

    const onCreate = useCallback(() =>
        createRecipe().then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate]);

    return (
        <PanelSwitcher
            name="recipes"
            defaultTab="All"
            actions={
                <button className="btn btn-ghost btn-sm text-primary" onClick={onCreate}>
                    <Plus className="w-4 -ml-1" /> Create
                </button>
            }>
            <PanelSwitcherContent title="All">
                <RecipeList />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    );
}
