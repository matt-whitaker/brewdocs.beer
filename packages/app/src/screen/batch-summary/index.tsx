import {ScreenH2, ScreenH3, ScreenP} from "@brewdocs.beer/design";
import Organics from "@/component/organics";
import {organicNames} from "@/component/organics/from-brewable";
import Screen from "@/component/screen";
import Vitals from "@/component/vitals";
import useActuals from "@/hooks/useActuals";
import useEstimatedIbu from "@/hooks/useEstimatedIbu";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/disambiguation";
import {parseNumberString} from "@/utils/math";

export type BatchSummaryProps = { batchId: string; };
export default function BatchSummary({ batchId }: BatchSummaryProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);
    const actuals = useActuals(batch);

    const measuredOg = parseNumberString(actuals.og?.value ?? "")[0];
    const estimatedIbu = useEstimatedIbu(
        batch.brewable.assignments,
        batch.batchSize,
        measuredOg > 0 ? actuals.og : recipe.targets.og
    );
    const brewed = {...actuals, ibu: estimatedIbu === null ? "—" : String(estimatedIbu)};

    return (
        <Screen>
            <div className="pt-2">
                <div className="lg:max-w-[80%] lg:pb-4">
                    <ScreenH2>{recipe.name}</ScreenH2>
                    <ScreenH3>{batch.name || ""}</ScreenH3>
                    <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                    {batch.brewer ? (<ScreenP>Brewed By {batch.brewer}</ScreenP>) : <></>}
                    <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
                </div>
                <div className="divider">Measurements</div>
                {}
                <Vitals className="-mt-2" vitals={[["Target", recipe.targets], ["Actuals", brewed]]} />
                <div className="divider">Organics</div>
                <Organics className="-mt-2" {...organicNames(batch.brewable.assignments)} />
            </div>
        </Screen>
    );
}
