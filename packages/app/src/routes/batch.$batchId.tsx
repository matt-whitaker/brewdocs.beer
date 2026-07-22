import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import updateBatch from "@/actions/updateBatch";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import BatchSummary from "@/screen/batch-summary";
import BatchPlanning from "../screen/batch-planning";
import BatchSchedule from "../screen/batch-schedule";
import BatchShopping from "../screen/batch-shopping";

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

function BatchPage() {
    const {batchId} = Route.useParams();
    const onChange = useCallback((batch: Batch) => { updateBatch(batch!.id, batch); }, []);

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
