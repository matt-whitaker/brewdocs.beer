import {useNavigate} from "@tanstack/react-router";
import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import createRecipe from "@/actions/createRecipe";
import ModalScreen from "@/component/modal/screen";
import {RecipeSource, useRecipeResource} from "@/state/recipeResource";

export type RecipeEditModalProps = { recipeId: string; source: RecipeSource };

/**
 * Modal screen for the "Edit" action. A catalog (KbRecipe) can't be edited in
 * place, so this clones it into a local recipe under a user-chosen name, then
 * navigates to that recipe's editor — the modal is the bail-out point. Takes the
 * recipe's source (the route knows it) so it loads via useRecipeResource.
 */
export default function RecipeEditModal({ recipeId, source }: RecipeEditModalProps) {
    const recipe = useRecipeResource(source, recipeId);
    const navigate = useNavigate();

    const [name, setName] = useState(recipe.name);

    const onConfirm = useCallback(() =>
        createRecipe(recipe, name.trim() || recipe.name)
            .then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate, recipe, name]);

    return (
        <ModalScreen title="Edit Recipe" onConfirm={onConfirm}>
            <span>
                <label>
                    Recipe name:
                    <InputText value={name} onChange={setName} primary className="xs:ml-2 mt-2" />
                </label>
            </span>
        </ModalScreen>
    );
}
