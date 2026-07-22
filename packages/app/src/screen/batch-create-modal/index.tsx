import {useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import createBatch from "@/actions/createBatch";
import CreateBatchForm from "@/component/create-batch-form";
import useCreatBatchForm from "@/component/create-batch-form/useCreateBatchForm";
import ModalScreen from "@/component/modal/screen";
import {useBatches} from "@/state/batches";
import {useKbRecipe} from "@/state/kbRecipes";

export type BatchCreateModalProps = { recipeId: string };

/**
 * Modal screen for the "Brew" action: names a new batch, then creates it from the
 * catalog recipe and navigates to it. Reads suspenseful recipe/batch data, so it
 * renders inside Action's own Suspense boundary and never suspends the route.
 */
export default function BatchCreateModal({ recipeId }: BatchCreateModalProps) {
    const batchesCount = useBatches().length;
    const recipe = useKbRecipe(recipeId);
    const navigate = useNavigate();

    const defaultBatchName = `Batch #${batchesCount + 1}`;
    const [batchInputs, setBatchInputs, finalInputs] = useCreatBatchForm(defaultBatchName);

    const onConfirm = useCallback(() =>
        createBatch(recipe, finalInputs).then((id) => navigate({to: "/batch/$batchId", params: {batchId: id}})),
    [navigate, recipe, finalInputs]);

    return (
        <ModalScreen title={recipe.name} onConfirm={onConfirm}>
            <CreateBatchForm defaultName={defaultBatchName} inputs={batchInputs} change={setBatchInputs} />
        </ModalScreen>
    );
}
