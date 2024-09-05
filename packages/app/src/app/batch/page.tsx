"use client";

import {useCallback} from "react";
import {useSearchParams} from "next/navigation";
import Batch from "@/model/batch";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Checklist from "@/screen/checklist";
import BrewDay from "@/screen/brew-day";
import Summary from "@/screen/summary";
import Shopping from "@/screen/shopping";
import Loading from "@/screen/loading";
import batchesState, {useBatches} from "@/state/batches";
import {useRecipes} from "@/state/recipes";

export default function Batch() {
    const batchId = useSearchParams().get("batchId");
    const [, batchesIndex] = useBatches();
    const [, recipesIndex] = useRecipes();
    const [active, setActive] = usePanelSwitcher("Brew Day");
    const onChange = useCallback((batch: Batch) => batchesState.update(batch), []);

    const batch = batchesIndex?.get(batchId);
    const recipe = batch && recipesIndex?.get(batch.recipeId);

    if (!batch || !recipe) return <Loading />;

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Shopping">
                <Shopping batch={batch} recipe={recipe} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Checklist">
                <Checklist batch={batch} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Brew Day">
                <BrewDay batch={batch} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Summary">
                <Summary batch={batch} recipe={recipe} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
