"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {ScreenH2, ScreenH3, ScreenP} from "@/component/typography";
import Error from "@/component/error";
import Recipe from "@/model/recipe";
import batchesState from "@/state/batches";

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {

    return (
        <Screen>
            <ScreenH2 className="mt-0">All Recipes</ScreenH2>
            <ul className="menu mt-4 px-0">
                {recipes.map((recipe, i) => (
                    <li key={i} className="odd:bg-base-200">
                        <Link href={`/batch?batchId=${recipe.id}`} className="text-left block" onClick={() => batchesState.createFromRecipe(recipe)}>
                            <ScreenH2 className="text-xl">{recipe.name}</ScreenH2>
                            <ScreenH3 className="text-lg mb-1">by {recipe.brewer}</ScreenH3>
                            <ScreenP>ABV {recipe.targets.abv}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og} | F.G. {recipe.targets.fg}</ScreenP>
                            <ScreenP>{recipe.description}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}