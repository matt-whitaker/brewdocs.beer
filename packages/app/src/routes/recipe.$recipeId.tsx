import {createFileRoute, useNavigate} from "@tanstack/react-router";
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
import {RecipeSource} from "@/state/recipeResource";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage,
    // the recipe list tags each item with the store it came from; default to the
    // catalog so direct links / existing kb navigation keep working
    validateSearch: (search: Record<string, unknown>): { source: RecipeSource } => ({
        source: search.source === "user" ? "user" : "kb",
    }),
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const {source} = Route.useSearch();
    const navigate = useNavigate();
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId]);

    const onEditUser = useCallback(() =>
        navigate({to: "/recipe/$recipeId/edit", params: {recipeId}}),
    [navigate, recipeId]);

    const brewAction = <Action label="Brew" icon={Plus} modalContent={<BatchCreateModal recipeId={recipeId} />} />;
    // a KB recipe can't be edited in place, so Edit clones it into a user recipe
    // (RecipeEditModal); a user recipe is already editable — Edit jumps to its editor
    const editAction = source === "user"
        ? <Action label="Edit" icon={Pencil} onClick={onEditUser} />
        : <Action label="Edit" icon={Pencil} modalContent={<RecipeEditModal recipeId={recipeId} />} />;

    // Brew is KB-only for now: batches resolve their recipe from the catalog
    // (useKbRecipe(batch.recipeId)), so a user-recipe batch wouldn't resolve yet
    const overviewActions = source === "user" ? [editAction] : [brewAction, editAction];

    return (
        <PanelSwitcher name="recipe" defaultTab="Overview">
            <PanelSwitcherContent
                title="Overview"
                actions={overviewActions}>
                <RecipeOverview recipeId={recipeId} source={source} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Batches" actions={editAction}>
                <BatchList filter={filterBatches} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
