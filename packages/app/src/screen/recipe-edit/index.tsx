import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import BrewableEdit from "@/screen/brewable-edit";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import {useRecipe} from "@/state/recipes";

// A name/brewer header, then BrewableEdit for the Ingredients/Equipment/Phases
// tabs. The recipe-specific "Details" panel is injected as panelsBefore, so this
// screen owns only the recipe chrome — BrewableEdit owns the brewable editing.
export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH3>{recipe.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
            </div>
            <BrewableEdit
                resourceId={recipeId}
                name="recipe.edit"
                defaultTab="Details"
                panelsBefore={
                    <PanelSwitcherContent title="Details">
                        <RecipeEditDetails recipeId={recipeId} />
                    </PanelSwitcherContent>
                }
            />
        </Screen>
    );
}
