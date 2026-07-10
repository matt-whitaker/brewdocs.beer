import {createFileRoute} from "@tanstack/react-router";
import {useCallback} from "react";
import Batch from "@/model/batch";
import usePanelSwitcher from "@/component/panel-switcher/usePanelSwitcher";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Checklists from "@/screen/checklists";
import BrewDay from "@/screen/schedule";
import BatchSummary from "@/screen/batch-summary";
import Shopping from "@/screen/shopping";
import Loading from "@/screen/loading";
import {useSession} from "@/state/session";
import Planning from "@/screen/planning";
import updateBatch from "@/actions/updateBatch";
import Statuses from "@/model/statuses";
import {useBatch} from "@/state/batches";
import {useRecipe} from "@/state/recipes";

export const Route = createFileRoute("/batch/$batchId")({
    component: BatchPage
});

function BatchPage() {
    const {batchId} = Route.useParams();
    const session = useSession();

    const batch = useBatch(batchId);
    const recipe = useRecipe(batch?.recipeId ?? null);

    const [active, setActive] = usePanelSwitcher((batch?.status ?? Statuses.PREP) > Statuses.PREP ? "Schedule" : "Planning");
    const onChange = useCallback((newBatch: Batch) => { updateBatch(batch!.id, newBatch); }, [batch]);

    if (!batch || !recipe) {
        return <Loading />
    }

    return (
        <PanelSwitcher>
            <PanelSwitcherContent active={active} change={setActive} title="Planning">
                <Planning batch={batch} recipe={recipe} onChange={onChange} />
            </PanelSwitcherContent>
            <PanelSwitcherContent active={active} change={setActive} title="Checklists">
                <Shopping batch={batch} recipe={recipe} onChange={onChange} />
                <Checklists batch={batch} session={session} onChange={onChange} />
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
