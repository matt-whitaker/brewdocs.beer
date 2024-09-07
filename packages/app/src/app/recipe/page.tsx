"use client";

import {useSearchParams} from "next/navigation";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Loading from "@/screen/loading";
import {useRecipes} from "@/state/recipes";
import RecipeOverview from "@/screen/recipe-overview";
import BatchList from "@/screen/batch-list";
import {useBatches} from "@/state/batches";

export default function RecipePage() {
    const recipeId = useSearchParams().get("recipeId");
    const [, recipesIndex] = useRecipes();
    const [batches] = useBatches();
    const [active, setActive] = usePanelSwitcher("Overview");

    const recipe = recipesIndex?.get(recipeId);

    if (!recipe || !batches) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Overview">
                <RecipeOverview recipe={recipe} batchesCount={batches.length} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Batches">
                <BatchList batches={batches.filter(batch => batch.recipeId === recipe.id)} recipes={recipesIndex!} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Editor">
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
