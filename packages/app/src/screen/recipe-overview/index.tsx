import {ScreenP, ScreenH2} from "@brewdocs.beer/design";
import Organics from "@/component/organics";
import {organicNames} from "@/component/organics/from-brewable";
import Screen from "@/component/screen";
import {RecipeSource, useRecipeResource} from "@/state/recipeResource";

export type RecipeOverviewProps = { recipeId: string; source: RecipeSource };
export default function RecipeOverview({ recipeId, source }: RecipeOverviewProps) {
    const recipe = useRecipeResource(source, recipeId);

    return (
        <Screen>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                <ScreenH2>{recipe.name}</ScreenH2>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                <ScreenP className="pt-2">ABV {recipe.targets.abv.value}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og.value} | F.G. {recipe.targets.fg.value}</ScreenP>
                <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
            </div>
            <div className="divider">Ingredients</div>
            <Organics className="-mt-2" {...organicNames(recipe.brewable.assignments)} />
        </Screen>
    );
}
