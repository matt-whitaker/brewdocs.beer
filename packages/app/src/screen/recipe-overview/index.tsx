"use client";

import Screen from "@/component/screen";
import {ScreenH2, ScreenH3, ScreenH4, ScreenP} from "@/component/typography";
import Recipe from "@/model/recipe";
import {Plus} from "@/component/svg";
import batchesState from "@/state/batches";
import {useCallback} from "react";
import {useRouter} from "next/navigation";
import Organics from "@/component/organics";

export type RecipeOverviewProps = { recipe: Recipe };
export default function RecipeOverview({ recipe }: RecipeOverviewProps) {
    const router = useRouter();
    const onClick = useCallback(() =>
        batchesState.createFromRecipe(recipe).then((id) => router.push(`/batch?batchId=${id}`)), [recipe]);
    return (
        <Screen>
            <ScreenH2>Recipe Overview</ScreenH2>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2">
                <ScreenH3>{recipe.name}</ScreenH3>
                <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                <ScreenP className="pt-2">ABV {recipe.targets.abv}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og} | F.G. {recipe.targets.fg}</ScreenP>
                <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
            </div>
            <button className="btn btn-primary btn-sm mb-4" onClick={onClick}>
                <Plus className="w-4 -ml-1" /> Brew this beer
            </button>
            <div className="divider">Ingredients</div>
            <Organics
                className="ml-4 -mt-2"
                hops={recipe.hops}
                grain={recipe.grains}
                yeast={recipe.yeast} />
            {/*<div className="divider">Measurements</div>*/}
            {/*<Vitals className="ml-4 -mt-2" vitals={[["Target", recipe.targets]]} />*/}
        </Screen>
    )
}