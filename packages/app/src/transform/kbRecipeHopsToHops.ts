import Hop from "@/model/hop";
import {kbScalarToScalar} from "@/utils/formatting";

/**
 * A KbRecipe's embedded ingredients already carry real per-recipe values
 * (unlike the catalog transforms in state/kb*.ts, which invent defaults) —
 * this just coerces KbScalar/loose strings into the app's Batch shape.
 */
export function kbRecipeHopsToHops(hops: KbRecipe["hops"]): Hop[] {
    return hops.map(({name, weight, alpha, boil, phase}) => ({
        name,
        weight: kbScalarToScalar(weight),
        alpha: kbScalarToScalar(alpha),
        boil: kbScalarToScalar(boil),
        phase: phase as Hop["phase"]
    }));
}