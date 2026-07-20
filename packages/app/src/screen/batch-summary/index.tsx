import Screen from "../../component/screen";
import Organics from "@/component/organics";
import Vitals from "@/component/vitals";
import {ScreenH1, ScreenH2, ScreenH3, ScreenP} from "@brewdocs.beer/design";
import {useBatch} from "@/state/batches";
import {useRecipe} from "@/state/recipes";

export type BatchSummaryProps = { batchId: string; }
export default function BatchSummary({ batchId }: BatchSummaryProps) {
    const batch = useBatch(batchId);
    const recipe = useRecipe(batch.recipeId);

    return (
        <Screen>
            <ScreenH1>Brew Summary</ScreenH1>
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
                <Vitals className="-mt-2" vitals={[["Target", recipe.targets], ["Actuals", batch.actuals]]} />
                <div className="divider">Organics</div>
                <Organics
                    className="-mt-2"
                    hops={batch.hops ?? recipe.hops}
                    grains={batch.grains ?? recipe.grains}
                    yeasts={batch.yeasts ?? recipe.yeasts} />
            </div>
        </Screen>
    )
}
