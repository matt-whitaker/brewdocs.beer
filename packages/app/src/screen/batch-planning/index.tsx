import {useCallback, useMemo} from "react";
import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import Screen from "@/component/screen";
import Batch from "@/model/batch";
import {currentPhaseIndex} from "@/model/batchProgress";
import Brewable from "@/model/brewable";
import BrewableEdit from "@/screen/brewable-edit";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/disambiguation";

export type BatchPlanningProps = {
    batchId: string;
    onChange: (patch: Partial<Batch>) => void
};

// A name header, then BrewableEdit for the Ingredients/Equipment/Phases tabs,
// mirroring recipe-edit. Brew-day facts (brewDate) live on BatchSchedule's Prep
// tab, not here.
export default function BatchPlanning({ batchId, onChange }: BatchPlanningProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);

    const onChangeBrewable = useCallback((brewable: Brewable) => onChange({ brewable }), [onChange]);
    const locked = useMemo(() => currentPhaseIndex(batch.brewable.schedule.phases, batch.tracker) > 0, [batch.brewable.schedule.phases, batch.tracker]);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH3>{batch.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
            </div>
            <BrewableEdit
                brewable={batch.brewable}
                onChangeBrewable={onChangeBrewable}
                name="batch.planning"
                defaultTab="Ingredients"
                locked={locked}
            />
        </Screen>
    );
}
