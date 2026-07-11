import {Link} from "@tanstack/react-router";
import Screen from "../../component/screen";
import {ScreenH1, ScreenH2, ScreenP} from "@brewdocs.beer/design";
import {statuses} from "@/model/statuses";
import {useSuspenseBatches} from "@/state/batches";
import {useSuspenseRecipes} from "@/state/recipes";
import useIndexBy from "@/hooks/useIndexBy";
import Batch from "@/model/batch";

export type BatchListProps = { filter?: (b: Batch) => boolean }
export default function BatchList({ filter }: BatchListProps) {
    const batches = useSuspenseBatches(filter);
    const recipes = useSuspenseRecipes();
    const recipesIndex = useIndexBy(recipes)!;

    return (
        <Screen>
            <ScreenH1>Your brews</ScreenH1>
            <ul className="w-full menu px-0">
                {batches.map((batch) => (
                    <li key={batch.id} className="odd:bg-base-200">
                        <Link to="/batch/$batchId" params={{batchId: batch.id}} className="text-left block">
                            <ScreenH2 className="text-lg">{recipesIndex.get(batch.recipeId)?.name || ""}</ScreenH2>
                            <ScreenP>{batch.name || ""}</ScreenP>
                            <ScreenP>by {batch.brewer || recipesIndex.get(batch.recipeId)?.brewer || ""}</ScreenP>
                            <ScreenP>Status: {statuses[batch.status]}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}