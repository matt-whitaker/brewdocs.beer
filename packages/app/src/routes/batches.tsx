import {createFileRoute} from "@tanstack/react-router";
import BrewList from "@/screen/batch-list";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Statuses from "@/model/statuses";
import {Suspense, useCallback} from "react";
import Batch from "@/model/batch";

export const Route = createFileRoute("/batches")({
    component: BatchesPage
});

function BatchesPage() {
    const [active, change] = usePanelSwitcher("batches", "Ready");

    const filterReady = useCallback((batch: Batch) => batch.status === Statuses.PREP, []);
    const filterBrewing = useCallback((batch: Batch) => batch.status > Statuses.PREP && batch.status < Statuses.FERMENT, []);
    const filterFermenting = useCallback((batch: Batch) => batch.status > Statuses.BOIL && batch.status < Statuses.COMPLETE, []);
    const filterComplete = useCallback((batch: Batch) => batch.status === Statuses.COMPLETE, []);

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Ready">
                <Suspense>
                    <BrewList filter={filterReady} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brewing">
                <Suspense>
                    <BrewList filter={filterBrewing} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Fermenting">
                <Suspense>
                    <BrewList filter={filterFermenting} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Complete">
                <Suspense>
                    <BrewList filter={filterComplete} />
                </Suspense>
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
