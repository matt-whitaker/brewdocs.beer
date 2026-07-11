import Boil from "@/model/boil";
import {kbScalarToScalar} from "@/utils/formatting";

export function kbRecipeBoilToBoil(boil: KbRecipe["boil"]): Boil[] {
    return boil.map(({name, time, hops}) => ({
        name,
        time: kbScalarToScalar(time),
        hops: hops as Boil["hops"]
    }));
}