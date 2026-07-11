import {createFileRoute} from "@tanstack/react-router";
import {Suspense, useCallback} from "react";
import Batch from "@/model/batch";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Checklists from "@/screen/checklists";
import Schedule from "@/screen/schedule";
import BatchSummary from "@/screen/batch-summary";
import Shopping from "@/screen/shopping";
import Planning from "@/screen/planning";
import updateBatch from "@/actions/updateBatch";

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

function BatchPage() {
    const {batchId} = Route.useParams();

    const [active, setActive] = usePanelSwitcher("Planning");
    const onChange = useCallback((batch: Batch) => { updateBatch(batch!.id, batch); }, []);

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Planning">
                <Suspense>
                    <Planning batchId={batchId} onChange={onChange} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Checklists">
                <Suspense>
                    <Shopping batchId={batchId} onChange={onChange} />
                </Suspense>
                <Suspense>
                    <Checklists batchId={batchId} onChange={onChange} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Schedule">
                <Suspense>
                    <Schedule batchId={batchId} onChange={onChange} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Summary">
                <Suspense>
                    <BatchSummary batchId={batchId} />
                </Suspense>
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
