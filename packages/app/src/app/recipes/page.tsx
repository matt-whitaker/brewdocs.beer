"use client";

import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";

export default function Recipes() {
    const [active, click] = usePanelSwitcher("All");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} click={click} title="All">
                <RecipeList />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} click={click} title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} click={click} title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    )
}