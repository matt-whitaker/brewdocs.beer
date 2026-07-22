import {useNavigate} from "@tanstack/react-router";
import {RefObject, Suspense, useCallback} from "react";
import createBatch from "@/actions/createBatch";
import CreateBatchForm from "@/component/create-batch-form";
import useCreatBatchForm from "@/component/create-batch-form/useCreateBatchForm";
import Modal from "@/component/modal";
import ModalFooter from "@/component/modal/footer";
import ModalTitle from "@/component/modal/title";
import useModal from "@/component/modal/useModal";
import {Plus} from "@/component/svg";
import {useBatches} from "@/state/batches";
import {useKbRecipe} from "@/state/kbRecipes";

export type BrewRecipeActionProps = { recipeId: string };

/**
 * Tab-row action that opens the "brew this recipe" modal. The trigger button
 * renders immediately; the modal's data reads (recipe + batches) sit behind a
 * local Suspense so they don't suspend the actions row, which lives outside the
 * PanelSwitcher's own boundary. The modal is closed at first paint, so a null
 * fallback is invisible.
 */
export default function BrewRecipeAction({ recipeId }: BrewRecipeActionProps) {
    const [modalRef, toggle] = useModal();

    return (
        <>
            <button className="btn btn-ghost btn-sm text-primary" onClick={toggle}>
                <Plus className="w-4 -ml-1" /> Brew
            </button>
            <Suspense fallback={null}>
                <BrewModal recipeId={recipeId} modalRef={modalRef} toggle={toggle} />
            </Suspense>
        </>
    );
}

type BrewModalProps = {
    recipeId: string;
    modalRef: RefObject<HTMLDialogElement>;
    toggle: () => void;
};

function BrewModal({ recipeId, modalRef, toggle }: BrewModalProps) {
    const batchesCount = useBatches().length;
    const recipe = useKbRecipe(recipeId);
    const navigate = useNavigate();

    const defaultBatchName = `Batch #${batchesCount + 1}`;
    const [batchInputs, setBatchInputs, finalInputs] = useCreatBatchForm(defaultBatchName);

    const onConfirm = useCallback(() =>
        createBatch(recipe, finalInputs).then((id) => navigate({to: "/batch/$batchId", params: {batchId: id}})),
    [navigate, recipe, finalInputs]);

    return (
        <Modal ref={modalRef}>
            <ModalTitle>{recipe.name}</ModalTitle>
            <CreateBatchForm defaultName={defaultBatchName} inputs={batchInputs} change={setBatchInputs} />
            <ModalFooter cancel={toggle} confirm={onConfirm} />
        </Modal>
    );
}
