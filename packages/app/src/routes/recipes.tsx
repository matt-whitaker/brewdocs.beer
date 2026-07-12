import {createFileRoute} from "@tanstack/react-router";
import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {Suspense} from "react";

export const Route = createFileRoute("/recipes")({
    component: RecipesPage
});

function RecipesPage() {
    const [active, change] = usePanelSwitcher("recipes", "All");

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="All">
                <Suspense>
                    <RecipeList />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    )
}
