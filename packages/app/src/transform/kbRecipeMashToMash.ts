import {Mash} from "@/model/mash";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeMashToMash(mash: KbRecipe["mash"]): Mash[] {
    return mash.map(({name, temp, time, grains}) => ({
        name,
        temp: kbScalarToScalar(temp),
        time: kbScalarToScalar(time),
        grains: grains as Mash["grains"]
    }));
}