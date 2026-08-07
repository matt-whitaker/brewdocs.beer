import {useCallback} from "react";
import {ScreenP} from "@brewdocs.beer/design";
import ModalScreen from "@/component/modal/screen";
import {deleteRecipe} from "@/state/recipes";

export type RecipeDeleteModalProps = { recipeId: string; name: string };

/**
 * Modal screen for a recipe row's delete action: confirms, then deletes.
 *
 * Only a user recipe reaches this — a catalog recipe has no delete affordance,
 * and nothing here could delete one anyway.
 *
 * Takes the recipe's `name` rather than reading it, for the reason given in
 * `screen/batch-delete-modal`: a list row's Action mounts its Modal
 * unconditionally, so a suspenseful read would cost one query per row.
 */
export default function RecipeDeleteModal({ recipeId, name }: RecipeDeleteModalProps) {
    const onConfirm = useCallback(() => { deleteRecipe(recipeId); }, [recipeId]);

    return (
        <ModalScreen title={`Delete ${name}?`} onConfirm={onConfirm}>
            <ScreenP>This can&apos;t be undone.</ScreenP>
        </ModalScreen>
    );
}
