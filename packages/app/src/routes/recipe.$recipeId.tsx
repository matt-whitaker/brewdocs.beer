import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import BatchList from "@/screen/batch-list";
import RecipeOverview from "@/screen/recipe-overview";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId]);

    return (
        <PanelSwitcher name="recipe" defaultTab="Overview">
            <PanelSwitcherContent title="Overview">
                <RecipeOverview recipeId={recipeId} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Batches">
                <BatchList filter={filterBatches} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Editor">
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
