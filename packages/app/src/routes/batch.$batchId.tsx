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

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

function BatchPage() {
    const {batchId} = Route.useParams();
    const onChange = useCallback((batch: Batch) => { updateBatch(batch!.id, batch); }, []);

    const breadcrumbs = useMemo<Crumb[]>(() => [
        { label: "Batches", to: "/batches" },
        dynamicCrumb(useBatch, [batchId], (batch) => batch.name),
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
