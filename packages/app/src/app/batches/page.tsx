"use client";

import BrewList from "../../screen/batch-list";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import {useBatches} from "@/state/batches";
import Loading from "@/screen/loading";
import {useRecipes} from "@/state/recipes";
import useIndexBy from "@/hooks/useIndexBy";
import Statuses from "@/model/statuses";
import {useMemo} from "react";

export default function BatchesPage() {
    const batches = useBatches();
    const recipesIndex = useIndexBy(useRecipes());
    const [active, change] = usePanelSwitcher("Ready");

    const [
        readyBatches,
        brewingBatches,
        fermentingBatches,
        completeBatches,

    ] = useMemo(() => [
        (batches ?? []).filter(batch => batch.status === Statuses.PREP),
        (batches ?? []).filter(batch => batch.status > Statuses.PREP && batch.status < Statuses.FERMENT),
        (batches ?? []).filter(batch => batch.status > Statuses.BOIL && batch.status < Statuses.COMPLETE),
        (batches ?? []).filter(batch => batch.status === Statuses.COMPLETE),
    ], [batches]);


    if (!batches || !recipesIndex) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Ready">
                <BrewList batches={readyBatches} recipesIndex={recipesIndex} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brewing">
                <BrewList batches={brewingBatches} recipesIndex={recipesIndex} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Fermenting">
                <BrewList batches={fermentingBatches} recipesIndex={recipesIndex} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Complete">
                <BrewList batches={completeBatches} recipesIndex={recipesIndex} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}