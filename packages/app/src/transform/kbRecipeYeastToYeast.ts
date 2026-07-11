import Yeast from "@/model/yeast";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeYeastToYeast(yeast: KbRecipe["yeast"]): Yeast[] {
    return yeast.map(({name, avg_attn, temp, starter}) => ({
        name,
        avg_attn: kbScalarToScalar(avg_attn),
        temp: kbScalarToScalar(temp),
        starter
    } as Yeast));
}