import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import createRecipe from "@/actions/createRecipe";
import Action from "@/component/action";
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

    const createAction = <Action label="Create" icon={Plus} onClick={onCreate} />;

    return (
        <PanelSwitcher name="recipes" defaultTab="All">
            <PanelSwitcherContent title="All">
                <RecipeList />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent
                title="My Recipes"
                actions={createAction}
            ></PanelSwitcherContent>
        </PanelSwitcher>
    );
}
