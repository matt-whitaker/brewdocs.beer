import {createFileRoute} from "@tanstack/react-router";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeOverview from "@/screen/recipe-overview";
import BatchList from "@/screen/batch-list";
import {Suspense, useCallback} from "react";
import Batch from "@/model/batch";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const [active, setActive] = usePanelSwitcher("recipe", "Overview");
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId])

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Overview">
                <Suspense>
                    <RecipeOverview recipeId={recipeId} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Batches">
                <Suspense>
                    <BatchList filter={filterBatches} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Editor">
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
