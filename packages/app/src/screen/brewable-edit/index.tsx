import {ReactNode, useCallback, useRef} from "react";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import useJsonEdit from "@/hooks/useJsonEdit";
import Brewable from "@/model/brewable";
import BrewableEditEquipment from "@/screen/brewable-edit/equipment";
import BrewableEditIngredients from "@/screen/brewable-edit/ingredients";
import BrewableEditPhases from "@/screen/brewable-edit/phases";
import {saveRecipe, useRecipe} from "@/state/recipes";

export type BrewableEditProps = {
    /** the resource whose brewable is edited — a Recipe for now (the pilot) */
    resourceId: string;
    /** PanelSwitcher name, for the active-tab query param */
    name?: string;
    defaultTab?: string;
    /** panels a host screen injects before/after the brewable panels */
    panelsBefore?: ReactNode;
    panelsAfter?: ReactNode;
};

/**
 * The reusable brewable editor. Loads a resource by id but only ever reads and
 * writes its `brewable`: one brewable-scoped edit cycle the panels share
 * (dot-paths are relative to the brewable), merged back onto the resource on
 * save. Host screens add their own panels via panelsBefore / panelsAfter — e.g.
 * recipe editing passes a "Details" panel as panelsBefore.
 */
export default function BrewableEdit({ resourceId, name = "brewable.edit", defaultTab = "Ingredients", panelsBefore, panelsAfter }: BrewableEditProps) {
    const recipe = useRecipe(resourceId);

    // merge into the freshest resource at save time — a sibling panel (e.g. the
    // Details panel passed as panelsBefore) may have changed other fields since
    const recipeRef = useRef(recipe);
    recipeRef.current = recipe;
    const onChange = useCallback((brewable: Brewable) => saveRecipe(resourceId, {...recipeRef.current, brewable}), [resourceId]);

    const [brewable, update, updateScalar, , add, remove, move] = useJsonEdit<Brewable>(recipe.brewable, onChange);

    return (
        <PanelSwitcher compact name={name} defaultTab={defaultTab}>
            {panelsBefore}
            <PanelSwitcherContent title="Ingredients">
                <BrewableEditIngredients brewable={brewable} update={update} updateScalar={updateScalar} add={add} remove={remove} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Equipment">
                <BrewableEditEquipment brewable={brewable} update={update} add={add} remove={remove} />
            </PanelSwitcherContent>
            <PanelSwitcherContent title="Phases">
                <BrewableEditPhases brewable={brewable} add={add} remove={remove} move={move} />
            </PanelSwitcherContent>
            {panelsAfter}
        </PanelSwitcher>
    );
}
