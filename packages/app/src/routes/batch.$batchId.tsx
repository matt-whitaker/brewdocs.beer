import {createFileRoute} from "@tanstack/react-router";
import {useCallback, useMemo} from "react";
import requireRecord from "@/actions/requireRecord";
import updateBatch from "@/actions/updateBatch";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import BatchPlanning from "@/screen/batch-planning";
import BatchSchedule from "@/screen/batch-schedule";
import BatchShopping from "@/screen/batch-shopping";
import BatchSummary from "@/screen/batch-summary";
import {findBatch, useBatch} from "@/state/batches";
import {useBatchRecipe} from "@/state/disambiguation";

const batchCrumbs = (batchId: string): Crumb[] => [
    { label: "Batches", to: "/batches" },
    dynamicCrumb(useBatchRecipe, [batchId], (r) => r.name, {
        link: ({source, recipeId}) => ({
            to: source === "kb" ? "/kb/recipe/$recipeId" : "/recipe/$recipeId",
            params: {recipeId},
        }),
    }),
    dynamicCrumb(useBatch, [batchId], ({ name }) => name),
];

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage,
    beforeLoad: ({params: {batchId}}) =>
        requireRecord({find: () => findBatch(batchId), crumbs: batchCrumbs(batchId)})
});

function BatchPage() {
    const {batchId} = Route.useParams();
    // a screen saves whatever slice it owns — a full-batch draft (Schedule/Shopping)
    // or a single field (Planning's brewable/brewDate); updateBatch merges it onto
    // the freshest stored batch and re-derives.
    const onChange = useCallback((patch: Partial<Batch>) => { updateBatch(batchId, patch); }, [batchId]);

    const breadcrumbs = useMemo(() => batchCrumbs(batchId), [batchId]);
    useBreadcrumbs(breadcrumbs);

    return (
        <PanelSwitcher name="batch" defaultTab="Planning">
            <PanelSwitcherContent title="Planning">
                <BatchPlanning batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Shopping">
                <BatchShopping batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Brewing">
                <BatchSchedule batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Summary">
                <BatchSummary batchId={batchId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
