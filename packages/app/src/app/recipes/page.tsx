"use client";

import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {useRecipes} from "@/state/recipes";
import Loading from "@/screen/loading";
import {useBatches} from "@/state/batches";

export default function RecipesPage() {
    useBatches(); // boil; just ensure batch state is instantiated for this page
    const [recipes] = useRecipes();
    const [active, change] = usePanelSwitcher("All");

    if (!recipes) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="All">
                <RecipeList recipes={recipes} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    )
}