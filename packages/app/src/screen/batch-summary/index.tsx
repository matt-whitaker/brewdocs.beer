import {ScreenH2, ScreenH3, ScreenP} from "@brewdocs.beer/design";
import Organics from "@/component/organics";
import {organicNames} from "@/component/organics/from-brewable";
import Screen from "@/component/screen";
import Vitals, {VitalsProps} from "@/component/vitals";
import useActuals from "@/hooks/useActuals";
import useEstimatedIbu from "@/hooks/useEstimatedIbu";
import {useBatch} from "@/state/batches";
import {parseNumberString} from "@/utils/math";

// Every recipe value here is the batch's own stored copy: the recipe it came
// from can be deleted, and a batch created before those fields existed simply
// has none — so each block renders only when it has something to show.
export type BatchSummaryProps = { batchId: string; };
export default function BatchSummary({ batchId }: BatchSummaryProps) {
    const batch = useBatch(batchId);
    const actuals = useActuals(batch);

    const measuredOg = parseNumberString(actuals.og?.value ?? "")[0];
    const estimatedIbu = useEstimatedIbu(
        batch.brewable.assignments,
        batch.batchSize,
        measuredOg > 0 ? actuals.og : batch.recipeTargets?.og
    );
    const brewed = {...actuals, ibu: estimatedIbu === null ? "—" : String(estimatedIbu)};
    const vitals: VitalsProps["vitals"] = batch.recipeTargets
        ? [["Target", batch.recipeTargets], ["Actuals", brewed]]
        : [["Actuals", brewed]];

    return (
        <Screen>
            <div className="pt-2">
                <div className="lg:max-w-[80%] lg:pb-4">
                    {batch.recipeName ? (<ScreenH2>{batch.recipeName}</ScreenH2>) : <></>}
                    <ScreenH3>{batch.name || ""}</ScreenH3>
                    {batch.recipeBrewer ? (<ScreenP>By {batch.recipeBrewer}</ScreenP>) : <></>}
                    {batch.brewer ? (<ScreenP>Brewed By {batch.brewer}</ScreenP>) : <></>}
                    {batch.recipeDescription ? (<ScreenP className="pt-4">{batch.recipeDescription}</ScreenP>) : <></>}
                </div>
                <div className="divider">Measurements</div>
                {}
                <Vitals className="-mt-2" vitals={vitals} />
                <div className="divider">Organics</div>
                <Organics className="-mt-2" {...organicNames(batch.brewable.assignments)} />
            </div>
        </Screen>
    );
}
