import {createFileRoute} from "@tanstack/react-router";
import {useCallback, useMemo} from "react";
import updateBatch from "@/actions/updateBatch";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import BatchPlanning from "@/screen/batch-planning";
import BatchSchedule from "@/screen/batch-schedule";
import BatchShopping from "@/screen/batch-shopping";
import BatchSummary from "@/screen/batch-summary";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/recipeResource";

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

// The batch crumb reads "{recipe} • {batch}". recipeSource is absent on batches
// created before that field — those were all catalog recipes, so treat as "kb".
function useBatchCrumbLabel(batchId: string) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);
    return { recipe: recipe.name, batch: batch.name };
}

function BatchPage() {
    const {batchId} = Route.useParams();
    const onChange = useCallback((batch: Batch) => { updateBatch(batch!.id, batch); }, []);

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Batches", to: "/batches" },
        dynamicCrumb(useBatchCrumbLabel, [batchId], ({recipe}) => `${recipe}`),
    ], [batchId]);
    useBreadcrumbs(breadcrumbs);

    return (
        <PanelSwitcher name="batch" defaultTab="Planning">
            <PanelSwitcherContent title="Planning">
                <BatchPlanning batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Shopping">
                <BatchShopping batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Schedule">
                <BatchSchedule batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Summary">
                <BatchSummary batchId={batchId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
