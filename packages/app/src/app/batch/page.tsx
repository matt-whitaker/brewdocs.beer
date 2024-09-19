"use client";

import {useCallback} from "react";
import {useSearchParams} from "next/navigation";
import Batch from "@/model/batch";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import BatchChecklist from "@/screen/batch-checklist";
import BrewDay from "@/screen/schedule";
import BatchSummary from "@/screen/batch-summary";
import Shopping from "@/screen/shopping";
import Loading from "@/screen/loading";
import batchesState, {useBatches} from "@/state/batches";
import {useRecipes} from "@/state/recipes";
import {useSession} from "@/state/session";
import Planning from "@/screen/planning";
import {FEATURES_PLANNING} from "@/utils/env";

export default function BatchPage() {
    const batchId = useSearchParams().get("batchId");
    const session = useSession();
    const [, batchesIndex] = useBatches();
    const [, recipesIndex] = useRecipes();
    const [active, setActive] = usePanelSwitcher("Summary");
    const onChange = useCallback((batch: Batch) => batchesState.update(batch), []);

    const batch = batchesIndex?.get(batchId!);
    const recipe = batch && recipesIndex?.get(batch.recipeId);

    if (!batch || !recipe || !session) return <Loading />;

    return (
        <PanelSwitcher>
            { FEATURES_PLANNING
                ? (
                    <PanelSwitcherContent active={active} change={setActive} title="Planning">
                        <Planning batch={batch} recipe={recipe} onChange={onChange} />
                    </PanelSwitcherContent>
                ) : (
                    <PanelSwitcherContent active={active} change={setActive} title="Planning" />
                )
            }
            <PanelSwitcherContent active={active} change={setActive} title="Checklists">
                <Shopping batch={batch} recipe={recipe} session={session} onChange={onChange} />
                <BatchChecklist batch={batch} session={session} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Schedule">
                <BrewDay batch={batch} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Summary">
                <BatchSummary batch={batch} recipe={recipe} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
