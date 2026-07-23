import {useNavigate} from "@tanstack/react-router";
import {useCallback, useState} from "react";
import {InputText} from "@brewdocs.beer/design";
import createRecipe from "@/actions/createRecipe";
import ModalScreen from "@/component/modal/screen";

const DEFAULT_NAME = "New Recipe";

/**
 * Modal screen for the "Create" action: names a new blank recipe, then creates
 * it and navigates to its editor. No data reads, so nothing suspends.
 */
export default function RecipeCreateModal() {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const onConfirm = useCallback(() =>
        createRecipe(undefined, name.trim() || DEFAULT_NAME)
            .then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate, name]);

    return (
        <ModalScreen title="Create Recipe" onConfirm={onConfirm}>
            <span>
                <label>
                    Recipe name:
                    <InputText value={name} onChange={setName} primary placeholder={DEFAULT_NAME} className="xs:ml-2 mt-2" />
                </label>
            </span>
        </ModalScreen>
    );
}
