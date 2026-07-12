import {KbRecipe} from "@brewdocs.beer/kb";
import Additive from "@/model/additive";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeAdditivesToAdditives(additives: KbRecipe["additives"]): Additive[] {
    return additives.map(({name, boil}) => ({name, boil: kbScalarToScalar(boil)}));
}