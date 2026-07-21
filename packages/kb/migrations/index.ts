import type {Migration} from "@brewdocs.beer/core";
import grains from "./grains";
import hops from "./hops";
import yeasts from "./yeasts";
import recipes from "./recipes";

const kbMigrations: Migration[] = [grains, hops, yeasts, recipes];

export default kbMigrations;
