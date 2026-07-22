import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {Pencil} from "@/component/svg";
import Batch from "@/model/batch";
import BatchList from "@/screen/batch-list";
import RecipeOverview from "@/screen/recipe-overview";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const navigate = useNavigate();
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId]);

    const onEdit = useCallback(() =>
        navigate({to: "/recipe/$recipeId/edit", params: {recipeId}}),
    [navigate, recipeId]);

    return (
        <PanelSwitcher
            name="recipe"
            defaultTab="Overview"
            actions={
                <button className="btn btn-ghost btn-sm text-primary" onClick={onEdit}>
                    <Pencil className="w-4 -ml-1" /> Edit
                </button>
            }>
            <PanelSwitcherContent title="Overview">
                <RecipeOverview recipeId={recipeId} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Batches">
                <BatchList filter={filterBatches} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
