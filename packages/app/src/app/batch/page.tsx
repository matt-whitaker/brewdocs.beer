"use client";

import Checklist from "@/screen/checklist";
import Summary from "@/screen/summary";
import BrewDay from "@/screen/brew-day";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {Suspense} from "react";

export default function Recipe() {
    const [active, change] = usePanelSwitcher("Brew Day");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Shopping"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Checklist">
                <Suspense>
                    <Checklist />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brew Day">
                <Suspense>
                    <BrewDay />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Summary">
                <Suspense>
                    <Summary />
                </Suspense>
            </PanelSwitcherContent>
        </PanelSwitcher>
    )
}
