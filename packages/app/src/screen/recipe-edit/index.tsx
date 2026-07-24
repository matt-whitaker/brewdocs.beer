import {ScreenH3, ScreenP} from "@brewdocs.beer/design";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import Screen from "@/component/screen";
import RecipeEditDetails from "@/screen/recipe-edit-details";
import RecipeEditIngredients from "@/screen/recipe-edit-ingredients";
import RecipeEditSchedule from "@/screen/recipe-edit-schedule";
import {useRecipe} from "@/state/recipes";

// Mirrors BatchPlanning: one Screen holds a name/brewer header, then a compact
// PanelSwitcher of sub-tabs. The route wraps this in a single-tab (non-compact)
// PanelSwitcher so the edit page reads like the batch page — a real page tab bar,
// content below — instead of a floating sub-nav. The sub-screens each own their
// useRecipe/useJsonEdit editing cycle and render bare (no Screen), so this Screen
// provides the only padding — matching how BatchPlanning's sub-panels render.
export type RecipeEditProps = { recipeId: string };
export default function RecipeEdit({ recipeId }: RecipeEditProps) {
    const recipe = useRecipe(recipeId);

    return (
        <Screen>
            <div className="pb-4 relative">
                <ScreenH3>{recipe.name || ""}</ScreenH3>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
            </div>
            <PanelSwitcher compact name="recipe.edit" defaultTab="Details">
                <PanelSwitcherContent title="Details">
                    <RecipeEditDetails recipeId={recipeId} />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Ingredients">
                    <RecipeEditIngredients recipeId={recipeId} />
                </PanelSwitcherContent>
                <PanelSwitcherContent title="Schedule">
                    <RecipeEditSchedule recipeId={recipeId} />
                </PanelSwitcherContent>
            </PanelSwitcher>
        </Screen>
    );
}
