import {Link} from "@tanstack/react-router";
import Screen from "../../component/screen";
import {ScreenH1} from "@brewdocs.beer/design";
import {useRecipes} from "@/state/recipes";
import RecipeListItem from "@/screen/recipe-list/item";
import {useMemo} from "react";

export default function RecipeList() {
    const recipes = useRecipes();

    const recipeListItems = useMemo(() => recipes.map((recipe, i) => (
        <RecipeListItem key={i} recipe={recipe} />
    )), [recipes]);

    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <ul className="w-full menu px-0">
                {recipeListItems}
            </ul>
        </Screen>
    )
}