"use client";

import BrewList from "../../screen/batch-list";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import useSubject from "@/state/useSubject";
import Batch from "@/model/batch";
import {useMemo} from "react";
import BatchesState from "@/state/batches";

export default function Batches() {
    const batches = useSubject<Batch[], []>(useMemo(() => new BatchesState(), []), []);
    const [active, change] = usePanelSwitcher("Complete");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Ready"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brewing"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Fermenting"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Complete">
                <BrewList batches={batches} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}