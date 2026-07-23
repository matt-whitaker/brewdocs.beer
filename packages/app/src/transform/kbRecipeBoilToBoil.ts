import {KbRecipe} from "@brewdocs.beer/kb";
import Boil from "@/model/boil";

// kb and app share the Scalar type; boil steps differ only in `hops` (loose
// string vs the app's "all" literal), so this is just a narrowing cast.
export function kbRecipeBoilToBoil(boil: KbRecipe["boil"]): Boil[] {
    return boil as Boil[];
}