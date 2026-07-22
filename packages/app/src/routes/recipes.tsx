import {createFileRoute} from "@tanstack/react-router";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeList from "@/screen/recipe-list";

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
    return (
        <PanelSwitcher name="recipes" defaultTab="All">
            <PanelSwitcherContent title="All">
                <RecipeList />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    );
}
