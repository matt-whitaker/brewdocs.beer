import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import Action from "@/component/action";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {Pencil, Plus} from "@/component/svg";
import Batch from "@/model/batch";
import BatchCreateModal from "@/screen/batch-create-modal";
import BatchList from "@/screen/batch-list";
import RecipeEditModal from "@/screen/recipe-edit-modal";
import RecipeOverview from "@/screen/recipe-overview";

export const Route = createFileRoute("/kb/recipe/$recipeId")({
    component: KbRecipePage
});

// Catalog (KbRecipe) view. The route fixes the source to "kb", so nothing here
// has to disambiguate. Brew a batch from it, or Edit (which clones it into an
// editable user recipe).
function KbRecipePage() {
    const {recipeId} = Route.useParams();
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId]);

    const brewAction = <Action label="Brew" icon={Plus} modalContent={<BatchCreateModal source="kb" recipeId={recipeId} />} />;
    const editAction = <Action label="Edit" icon={Pencil} modalContent={<RecipeEditModal source="kb" recipeId={recipeId} />} />;

    return (
        <PanelSwitcher name="recipe" defaultTab="Overview">
            <PanelSwitcherContent title="Overview" actions={[brewAction, editAction]}>
                <RecipeOverview recipeId={recipeId} source="kb" />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Batches" actions={editAction}>
                <BatchList filter={filterBatches} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
