"use client";

import Link from "next/link";
import Screen from "../../component/screen";
import {ScreenH1, ScreenH2, ScreenH3, ScreenP} from "@/component/typography";
import Recipe from "@/model/recipe";

export default function RecipeList({ recipes }: { recipes: Recipe[] }) {
    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <ul className="menu px-0">
                {recipes.map((recipe, i) => (
                    <li key={i} className="odd:bg-base-200">
                        <Link href={`/recipe?recipeId=${recipe.id}`} className="text-left block">
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