import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import Batch from "@/model/batch";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import BatchSchedule from "../screen/batch-schedule";
import BatchSummary from "@/screen/batch-summary";
import Shopping from "@/screen/shopping";
import Planning from "@/screen/planning";
import updateBatch from "@/actions/updateBatch";

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

function BatchPage() {
    const {batchId} = Route.useParams();
    const onChange = useCallback((batch: Batch) => { updateBatch(batch!.id, batch); }, []);

    return (
        <PanelSwitcher name="batch" defaultTab="Planning">
            <PanelSwitcherContent title="Planning">
                <Planning batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Shopping">
                <Shopping batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="BatchSchedule">
                <BatchSchedule batchId={batchId} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Summary">
                <BatchSummary batchId={batchId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
