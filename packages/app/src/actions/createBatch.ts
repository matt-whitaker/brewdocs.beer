import {KbRecipe} from "@brewdocs.beer/kb";
import {CreateBatchState} from "@/component/create-batch-form/useCreateBatchForm";
import batchesStorage from "@/storage/batches";
import Batch from "@/model/batch";
import Hop from "@/model/hop";
import Grain from "@/model/grain";
import Yeast from "@/model/yeast";
import Additive from "@/model/additive";
import {Mash} from "@/model/mash";
import Boil from "@/model/boil";
import equipment from "@/data/equipment";
import {intersection} from "@/utils/func";
import {kbScalarToScalar} from "@/utils/formatting";
import defaultBatch from "@/data/defaultBatch";
import _updateShopping from "@/actions/_updateShopping";
import Statuses from "@/model/statuses";
import {saveBatch} from "@/state/batches";

/**
 * A KbRecipe's embedded ingredients already carry real per-recipe values
 * (unlike the catalog transforms in state/kb*.ts, which invent defaults) —
 * this just coerces KbScalar/loose strings into the app's Batch shape.
 */
function kbRecipeHopsToHops(hops: KbRecipe["hops"]): Hop[] {
    return hops.map(({ name, weight, alpha, boil, phase }) => ({
        name,
        weight: kbScalarToScalar(weight),
        alpha: kbScalarToScalar(alpha),
        boil: kbScalarToScalar(boil),
        phase: phase as Hop["phase"]
    }));
}

function kbRecipeGrainsToGrains(grains: KbRecipe["grains"]): Grain[] {
    return grains.map(({ name, weight }) => ({ name, weight: kbScalarToScalar(weight) }));
}

function kbRecipeYeastToYeast(yeast: KbRecipe["yeast"]): Yeast[] {
    return yeast.map(({ name, avg_attn, temp, starter }) => ({
        name,
        avg_attn: kbScalarToScalar(avg_attn),
        temp: kbScalarToScalar(temp),
        starter
    } as Yeast));
}

function kbRecipeAdditivesToAdditives(additives: KbRecipe["additives"]): Additive[] {
    return additives.map(({ name, boil }) => ({ name, boil: kbScalarToScalar(boil) }));
}

function kbRecipeMashToMash(mash: KbRecipe["mash"]): Mash[] {
    return mash.map(({ name, temp, time, grains }) => ({
        name,
        temp: kbScalarToScalar(temp),
        time: kbScalarToScalar(time),
        grains: grains as Mash["grains"]
    }));
}

function kbRecipeBoilToBoil(boil: KbRecipe["boil"]): Boil[] {
    return boil.map(({ name, time, hops }) => ({
        name,
        time: kbScalarToScalar(time),
        hops: hops as Boil["hops"]
    }));
}

export default async function createBatch(recipe: KbRecipe, inputs: CreateBatchState) {
    const id = await batchesStorage.generateId();

    let batch: Batch = {
        ...defaultBatch,
        id,
        status: Statuses.PREP,
        recipeId: recipe.id,

        hops: kbRecipeHopsToHops(recipe.hops),
        grains: kbRecipeGrainsToGrains(recipe.grains),
        yeast: kbRecipeYeastToYeast(recipe.yeast),
        additives: kbRecipeAdditivesToAdditives(recipe.additives),
        mash: kbRecipeMashToMash(recipe.mash),
        boil: kbRecipeBoilToBoil(recipe.boil),

        // Generate the checklist based on the configured equipment
        checklists: (recipe.checklist.map(({ name, uses }) => ({
            name,
            items: equipment
                .filter(({ use }) => !!intersection(uses, use).length)
                .map((ment) => ({ completed: false, name: ment.name }))
        }))),
        shopping: [],

        // Inputs override all
        ...inputs
    }

    _updateShopping(batch);

    await saveBatch(id, batch)

    return id;
}
