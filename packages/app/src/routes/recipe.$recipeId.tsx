import {createFileRoute, useNavigate} from "@tanstack/react-router";
import {useCallback, useMemo} from "react";
import {Pencil, Plus} from "@brewdocs.beer/design";
import requireRecord from "@/actions/requireRecord";
import Action from "@/component/action";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import {Crumb, dynamicCrumb} from "@/model/crumb";
import {useBreadcrumbs} from "@/providers/breadcrumbs";
import BatchCreateModal from "@/screen/batch-create-modal";
import BatchList from "@/screen/batch-list";
import RecipeOverview from "@/screen/recipe-overview";
import {findRecipeResource, useRecipeResource} from "@/state/disambiguation";

export const Route = createFileRoute("/recipe/$recipeId")({
    component: RecipePage,
    beforeLoad: ({params: {recipeId}}) =>
        requireRecord({find: () => findRecipeResource("user", recipeId), to: "/recipes"})
});

function RecipePage() {
    const {recipeId} = Route.useParams();
    const navigate = useNavigate();
    const filterBatches = useCallback((batch: Batch) => batch.recipeId === recipeId, [recipeId]);

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Recipes", to: "/recipes" },
        dynamicCrumb(useRecipeResource, ["user", recipeId], ({ name }) => name),
    ], [recipeId]);
    useBreadcrumbs(breadcrumbs);

    // a user recipe is already editable — Edit goes straight to its editor (unlike
    // the catalog route, where Edit clones the recipe first)
    const onEdit = useCallback(() =>
        navigate({to: "/recipe/$recipeId/edit", params: {recipeId}}),
    [navigate, recipeId]);

    const brewAction = <Action label="Brew" icon={Plus} modalContent={<BatchCreateModal source="user" recipeId={recipeId} />} />;
    const editAction = <Action label="Edit" icon={Pencil} onClick={onEdit} />;

    return (
        <PanelSwitcher name="recipe" defaultTab="Overview">
            <PanelSwitcherContent
                title="Overview"
                actions={[brewAction, editAction]}>
                <RecipeOverview source="user" recipeId={recipeId} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Batches" actions={editAction}>
                <BatchList filter={filterBatches} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
