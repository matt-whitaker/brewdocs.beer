import {useNavigate} from "@tanstack/react-router";
import {useCallback} from "react";
import {ScreenH1, ScreenH2, ScreenP} from "@brewdocs.beer/design";
import createBatch from "@/actions/createBatch";
import createRecipe from "@/actions/createRecipe";
import CreateBatchForm from "@/component/create-batch-form";
import useCreatBatchForm from "@/component/create-batch-form/useCreateBatchForm";
import Modal from "@/component/modal";
import ModalFooter from "@/component/modal/footer";
import ModalTitle from "@/component/modal/title";
import useModal from "@/component/modal/useModal";
import Organics from "@/component/organics";
import Screen from "@/component/screen";
import {Plus} from "@/component/svg";
import {useBatches} from "@/state/batches";
import {useKbRecipe} from "@/state/kbRecipes";

export type RecipeOverviewProps = { recipeId: string };
export default function RecipeOverview({ recipeId }: RecipeOverviewProps) {
    const batchesCount = useBatches().length;
    const recipe = useKbRecipe(recipeId);

    const defaultBatchName = `Batch #${batchesCount+1}`;
    const [modalRef, toggle] = useModal();
    const [batchInputs, setBatchInputs, finalInputs] = useCreatBatchForm(defaultBatchName);
    const navigate = useNavigate();

    const onConfirm = useCallback(() =>
        createBatch(recipe, finalInputs).then((id) => navigate({to: "/batch/$batchId", params: {batchId: id}})),
    [navigate, recipe, finalInputs]);

    const onEdit = useCallback(() =>
        createRecipe(recipe).then((id) => navigate({to: "/recipe/$recipeId/edit", params: {recipeId: id}})),
    [navigate, recipe]);

    return (
        <Screen>
            <ScreenH1>Recipe Overview</ScreenH1>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2 pt-2">
                <ScreenH2>{recipe.name}</ScreenH2>
                <ScreenP>By {`${recipe.brewer}`}</ScreenP>
                <ScreenP className="pt-2">ABV {recipe.targets.abv.value}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og.value} | F.G. {recipe.targets.fg.value}</ScreenP>
                <ScreenP className="pt-4">{`${recipe.description}`}</ScreenP>
            </div>
            <button className="btn btn-primary btn-sm" onClick={toggle}>
                <Plus className="w-4 -ml-1" /> Brew this beer
            </button>
            <Modal ref={modalRef}>
                <ModalTitle>{recipe.name}</ModalTitle>
                <CreateBatchForm defaultName={defaultBatchName} inputs={batchInputs} change={setBatchInputs} />
                <ModalFooter cancel={toggle} confirm={onConfirm} />
            </Modal>
            <div className="divider">Ingredients</div>
            <Organics
                className="-mt-2"
                hops={recipe.hops}
                grains={recipe.grains}
                yeasts={recipe.yeasts} />
        </Screen>
    );
}