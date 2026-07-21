import {createFileRoute} from "@tanstack/react-router";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeOverview from "@/screen/recipe-overview";
import BatchList from "@/screen/batch-list";
import {useCallback} from "react";
import Batch from "@/model/batch";

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
