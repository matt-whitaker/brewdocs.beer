import {Link} from "@tanstack/react-router";
import Screen from "../../component/screen";
import {ScreenH1, ScreenH2, ScreenP} from "@brewdocs.beer/design";
import {useRecipes} from "@/state/recipes";

export default function RecipeList() {
    const recipes = useRecipes();

    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <ul className="w-full menu px-0">
                {recipes.map((recipe, i) => (
                    <li key={i} className="odd:bg-base-200">
                        <Link to="/recipe/$recipeId" params={{recipeId: recipe.id}} className="text-left block">
                            <ScreenH2 className="text-lg">{recipe.name}</ScreenH2>
                            <ScreenP className="mb-1">by {recipe.brewer}</ScreenP>
                            <ScreenP>ABV {recipe.targets.abv.value}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og.value} | F.G. {recipe.targets.fg.value}</ScreenP>
                            <ScreenP className="pt-2">{recipe.description}</ScreenP>
                        </Link>
                    </li>
                ))}
            </ul>
        </Screen>
    )
}