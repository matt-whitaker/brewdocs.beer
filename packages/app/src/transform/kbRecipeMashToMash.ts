import {KbRecipe} from "@brewdocs.beer/kb";
import {Mash} from "@/model/mash";

// kb and app share the Scalar type; mash steps differ only in `grains` (loose
// string vs the app's "all" literal), so this is just a narrowing cast.
export function kbRecipeMashToMash(mash: KbRecipe["mash"]): Mash[] {
    return mash as Mash[];
}