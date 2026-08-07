import {createFileRoute} from "@tanstack/react-router";
import {useMemo} from "react";
import requireRecord from "@/actions/requireRecord";
import {Crumb, dynamicCrumb, useBreadcrumbs} from "@/component/breadcrumbs/context";
import PanelSwitcher from "@/component/panel-switcher";
import PanelSwitcherContent from "@/component/panel-switcher/content";
import RecipeEdit from "@/screen/recipe-edit";
import {findRecipeResource, useRecipeResource} from "@/state/disambiguation";

const recipeEditCrumbs = (recipeId: string): Crumb[] => [
    { label: "Recipes", to: "/recipes" },
    dynamicCrumb(useRecipeResource, ["user", recipeId], ({ name }) => name, { to: "/recipe/$recipeId", params: {recipeId} }),
    { label: "Edit" },
];

export const Route = createFileRoute("/recipe/$recipeId_/edit")({
    component: RecipeEditPage,
    beforeLoad: ({params: {recipeId}}) =>
        requireRecord({find: () => findRecipeResource("user", recipeId), crumbs: recipeEditCrumbs(recipeId)})
});

function RecipeEditPage() {
    const {recipeId} = Route.useParams();

    const breadcrumbs = useMemo(() => recipeEditCrumbs(recipeId), [recipeId]);
    useBreadcrumbs(breadcrumbs);

    // Single-tab outer switcher (not compact) so the edit page carries a real page
    // tab bar like the batch page; the batch-planning-style header + compact sub-tabs
    // live inside RecipeEdit.
    return (
        <PanelSwitcher name="recipe.edit.page" defaultTab="Planning">
            <PanelSwitcherContent title="Planning">
                <RecipeEdit recipeId={recipeId} />
            </PanelSwitcherContent>
        </PanelSwitcher>
    );
}
