"use client";

import {Suspense, useCallback, useMemo} from "react";
import {useSearchParams} from "next/navigation";
import BatchState from "@/state/batch";
import useSubject from "@/state/useSubject";
import Batch from "@/model/batch";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Checklist from "@/screen/checklist";
import BrewDay from "@/screen/brew-day";
import Summary from "@/screen/summary";
import Shopping from "@/screen/shopping";

export default function Recipe() {
    const batchId = useSearchParams().get("batchId");
    const batchState = useMemo(() => new BatchState(batchId!), [batchId]);
    const [batch] = useSubject<Batch>(batchState);
    const onChange = useCallback((batch: Batch) => batchState.update(batch), [batchState]);
    const [active, setActive] = usePanelSwitcher("Brew Day");

    if (!batch) return null;

    return (
        <Suspense>
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
        </Suspense>
    );
}
