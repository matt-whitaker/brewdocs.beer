import {KbRecipe} from "@brewdocs.beer/kb";
import Yeast from "@/model/yeast";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeYeastsToYeasts(yeasts: KbRecipe["yeasts"]): Yeast[] {
    return yeasts.map(({name, avg_attn, temp, starter}) => ({
        name,
        avg_attn: kbScalarToScalar(avg_attn),
        temp: kbScalarToScalar(temp),
        starter
    }));
}