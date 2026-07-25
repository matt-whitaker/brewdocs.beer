import {ReactNode} from "react";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import useJsonEdit from "@/hooks/useJsonEdit";
import Brewable from "@/model/brewable";
import BrewableEditEquipment from "@/screen/brewable-edit/equipment";
import BrewableEditIngredients from "@/screen/brewable-edit/ingredients";
import BrewableEditPhases from "@/screen/brewable-edit/phases";

export type BrewableEditProps = {
    /** the brewable being edited — the caller owns loading it and persisting edits */
    brewable: Brewable;
    /** called with the edited brewable to persist; the caller merges it back onto its resource */
    onChangeBrewable: (brewable: Brewable) => void;
    /** PanelSwitcher name, for the active-tab query param */
    name?: string;
    defaultTab?: string;
    /** panels a host screen injects before/after the brewable panels */
    panelsBefore?: ReactNode;
    panelsAfter?: ReactNode;
};

/**
 * The reusable brewable editor. Takes an already-loaded `brewable` and a save
 * callback from the caller, and only ever reads/writes that brewable: one
 * brewable-scoped edit cycle the panels share (dot-paths are relative to the
 * brewable). Host screens add their own panels via panelsBefore / panelsAfter
 * — e.g. recipe editing passes a "Details" panel as panelsBefore.
 */
export default function BrewableEdit({ brewable: initialBrewable, onChangeBrewable, name = "brewable.edit", defaultTab = "Ingredients", panelsBefore, panelsAfter }: BrewableEditProps) {
    const [brewable, update, updateScalar, , add, remove, move] = useJsonEdit<Brewable>(initialBrewable, onChangeBrewable);

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
