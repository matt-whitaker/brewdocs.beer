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
    const batchState = useMemo(() => new BatchState(batchId), [batchId]);
    const batch = useSubject<Batch, null>(batchState, null);
    const onChange = useCallback((batch) => batchState.update(batch), [batchState]);

    const [active, change] = usePanelSwitcher("Brew Day");
    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={change} title="Shopping"></PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Checklist">
                <Suspense>
                    <Checklist batch={batch} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Brew Day">
                <Suspense>
                    <BrewDay batch={batch} onChange={onChange} />
                </Suspense>
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={change} title="Summary">
                <Suspense>
                    <Summary batch={batch} />
                </Suspense>
            </PanelSwitcherContent>
        </PanelSwitcher>
    )
}
