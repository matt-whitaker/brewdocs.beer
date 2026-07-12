import {KbRecipe} from "@brewdocs.beer/kb";
import Grain from "@/model/grain";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeGrainsToGrains(grains: KbRecipe["grains"]): Grain[] {
    return grains.map(({name, weight}) => ({name, weight: kbScalarToScalar(weight)}));
}