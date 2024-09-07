"use client";

import Screen from "@/component/screen";
import {ScreenH2, ScreenH3, ScreenH4, ScreenP} from "@/component/typography";
import Recipe from "@/model/recipe";
import {Plus} from "@/component/svg";
import batchesState from "@/state/batches";
import {useCallback} from "react";
import {useRouter} from "next/navigation";
import Organics from "@/component/organics";
import Modal from "@/component/modal";
import ModalTitle from "@/component/modal/title";
import ModalFooter from "@/component/modal/footer";
import useModal from "@/component/modal/useModal";
import CreateBatchForm from "../../component/create-batch-form";
import useCreatBatchForm from "@/component/create-batch-form/useCreateBatchForm";

export type RecipeOverviewProps = { recipe: Recipe, batchesCount: number };
export default function RecipeOverview({ recipe, batchesCount }: RecipeOverviewProps) {
    const defaultBatchName = `Batch #${batchesCount+1}`;
    const [modalRef, toggle] = useModal();
    const [batchInputs, setBatchInputs, finalInputs] = useCreatBatchForm(defaultBatchName);
    const router = useRouter();

    const onConfirm = useCallback(() =>
            batchesState.createFromRecipe(recipe, finalInputs).then((id) => router.push(`/batch?batchId=${id}`)),
        [batchInputs, recipe, finalInputs]);

    return (
        <Screen>
            <ScreenH2>Recipe Overview</ScreenH2>
            <div className="lg:max-w-[80%] lg:pb-4 pb-2">
                <ScreenH3>{recipe.name}</ScreenH3>
                <ScreenH4>By {`${recipe.brewer}`}</ScreenH4>
                <ScreenP className="pt-2">ABV {recipe.targets.abv}% | IBUs {recipe.targets.ibu} | O.G. {recipe.targets.og} | F.G. {recipe.targets.fg}</ScreenP>
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
                className="ml-4 -mt-2"
                hops={recipe.hops}
                grain={recipe.grains}
                yeast={recipe.yeast} />
        </Screen>
    )
}