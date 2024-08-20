"use client";

import Checklist from "@/screen/checklist";
import Summary from "@/screen/summary";
import BrewDay from "@/screen/brew-day";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";

export default function Recipe() {
    const [active, change] = usePanelSwitcher("Brew Day");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Shopping"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Checklist">
                <Checklist />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brew Day">
                <BrewDay />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Summary">
                <Summary />
            </PanelSwitcherContent>
        </PanelSwitcher>
    )
}
