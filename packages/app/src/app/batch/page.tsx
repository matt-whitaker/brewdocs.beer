"use client";

import Checklist from "@/screen/checklist";
import Summary from "@/screen/summary";
import BrewDay from "@/screen/brew-day";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import PanelSwitcher from "@/component/panel-switcher";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import {Suspense, useCallback, useMemo} from "react";
import {useSearchParams} from "next/navigation";
import useSubject from "@/state/useSubject";
import Batch from "@/model/batch";
import BatchState from "@/state/batch";

export default function Recipe() {
    const batchId = useSearchParams().get("batchId");
    const batchState = useMemo(() => new BatchState(batchId!), [batchId]);
    const batch = useSubject<Batch>(batchState);
    const onChange = useCallback((batch: Batch) => batchState.update(batch), [batchState]);
    const [active, setActive] = usePanelSwitcher("Brew Day");

    if (!batch) return null;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Shopping"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Checklist">
                <Checklist batch={batch} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Brew Day">
                <BrewDay batch={batch} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Summary">
                <Summary batch={batch} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    )
}
