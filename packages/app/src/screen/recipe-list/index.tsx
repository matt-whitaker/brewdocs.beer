import {useMemo} from "react";
import {ScreenH1} from "@brewdocs.beer/design";
import {KbRecipe} from "@brewdocs.beer/kb/src";
import Screen from "@/component/screen";
import Recipe from "@/model/recipe";
import RecipeListItem from "@/screen/recipe-list/item";
import {useKbRecipes} from "@/state/kbRecipes";
import {useRecipes} from "@/state/recipes";
import {FilterFn} from "@/utils/func";


export type RecipeListProps = {
    source: "all"|"user"|"kb"
    filterFn?: FilterFn<Recipe | KbRecipe>
};

export default function RecipeList({ source = "all",  filterFn }: RecipeListProps) {
    const recipes = useRecipes();
    const kbRecipes = useKbRecipes();

    const shownRecipes = useMemo(() => {
        const all = {
            "all": [kbRecipes, recipes],
            "user": [recipes],
            "kb": [kbRecipes]
        }[source].flat().filter(r => !!r);
        return filterFn ? all.filter(filterFn) : all;

    }, [recipes, kbRecipes, source, filterFn]);

    const recipeListItems = useMemo(() => shownRecipes.map((recipe, i) => (
        <RecipeListItem key={i} recipe={recipe} />
    )), [shownRecipes]);

    return (
        <Screen>
            <ScreenH1>All Recipes</ScreenH1>
            <ul className="w-full menu px-0">
                {recipeListItems}
            </ul>
        </Screen>
    );
}