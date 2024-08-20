"use client";

import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";

export default function Recipes() {
    const [active, change] = usePanelSwitcher("All");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="All">
                <RecipeList />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Starred"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="My Recipes"></PanelSwitcherContent>
        </PanelSwitcher>
    )
}