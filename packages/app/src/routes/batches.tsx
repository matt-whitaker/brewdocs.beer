import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import {Crumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Batch from "@/model/batch";
import {batchProgress} from "@/model/batchProgress";
import {PhaseType} from "@/model/brewable";
import BrewList from "@/screen/batch-list";

// module const so the array is stable across renders (see useBreadcrumbs)
const BREADCRUMBS: Crumb[] = [{ label: "Batches" }];

const BREWING_PHASE_TYPES: PhaseType[] = ["mash", "boil"];
const FERMENTING_PHASE_TYPES: PhaseType[] = ["ferment", "carbonation", "conditioning"];

const isMidwayThrough = (batch: Batch, types: PhaseType[]) => {
    const {started, complete, currentPhase} = batchProgress(batch);
    return started && !complete && !!currentPhase && types.includes(currentPhase.type);
};

export const Route = createFileRoute("/batches")({
    component: BatchesPage
});

function BatchesPage() {
    useBreadcrumbs(BREADCRUMBS);

    const filterReady = useCallback((batch: Batch) => !batchProgress(batch).started, []);
    const filterBrewing = useCallback((batch: Batch) => isMidwayThrough(batch, BREWING_PHASE_TYPES), []);
    const filterFermenting = useCallback((batch: Batch) => isMidwayThrough(batch, FERMENTING_PHASE_TYPES), []);
    const filterComplete = useCallback((batch: Batch) => batchProgress(batch).complete, []);

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
