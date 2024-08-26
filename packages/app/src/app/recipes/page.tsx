"use client";

import RecipeList from "@/screen/recipe-list";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import useSubject from "@/state/useSubject";
import Recipe from "@/model/recipe";
import {useMemo} from "react";
import RecipesState from "@/state/recipes";

export default function Recipes() {
    const recipes = useSubject<Recipe[], []>(useMemo(() => new RecipesState(), []), []);
    const [active, change] = usePanelSwitcher("All");
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