import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import {Crumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import Statuses from "@/model/statuses";
import BrewList from "@/screen/batch-list";

// module const so the array is stable across renders (see useBreadcrumbs)
const BREADCRUMBS: Crumb[] = [{ label: "Batches" }];

export const Route = createFileRoute("/batches")({
    component: BatchesPage
});

function BatchesPage() {
    useBreadcrumbs(BREADCRUMBS);

    const filterReady = useCallback((batch: Batch) => batch.status === Statuses.PREP, []);
    const filterBrewing = useCallback((batch: Batch) => batch.status > Statuses.PREP && batch.status < Statuses.FERMENT, []);
    const filterFermenting = useCallback((batch: Batch) => batch.status > Statuses.BOIL && batch.status < Statuses.COMPLETE, []);
    const filterComplete = useCallback((batch: Batch) => batch.status === Statuses.COMPLETE, []);

    return (
        <PanelSwitcher name="batches" defaultTab="Ready">
            <PanelSwitcherContent title="Ready">
                <BrewList filter={filterReady} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Brewing">
                <BrewList filter={filterBrewing} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Fermenting">
                <BrewList filter={filterFermenting} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Complete">
                <BrewList filter={filterComplete} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
