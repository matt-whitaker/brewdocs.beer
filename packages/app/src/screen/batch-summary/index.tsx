import {ScreenH2, ScreenH3, ScreenP} from "@brewdocs.beer/design";
import Organics from "@/component/organics";
import {organicNames} from "@/component/organics/from-brewable";
import Screen from "@/component/screen";
import Vitals from "@/component/vitals";
import useDerivedGravity from "@/hooks/useDerivedGravity";
import {useBatch} from "@/state/batches";
import {useRecipeResource} from "@/state/disambiguation";

export type BatchSummaryProps = { batchId: string; };
export default function BatchSummary({ batchId }: BatchSummaryProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipeResource(batch.recipeSource ?? "kb", batch.recipeId);
    const gravity = useDerivedGravity(batch.brewable, batch.tracker);

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
                {/* Need to refactor this type */}
                <Vitals className="-mt-2" vitals={[["Target", recipe.targets], ["Actuals", {...batch.actuals, ...gravity}]]} />
                <div className="divider">Organics</div>
                <Organics className="-mt-2" {...organicNames(batch.brewable.assignments)} />
            </div>
        </Screen>
    );
}
