"use client";

import BrewList from "../../screen/batch-list";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";

export default function Batches() {
    const [active, click] = usePanelSwitcher("Complete");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} click={click} title="Ready"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} click={click} title="Brewing"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} click={click} title="Fermenting"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} click={click} title="Complete">
                <BrewList />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}