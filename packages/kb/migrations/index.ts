import type {Migration} from "@brewdocs.beer/core";
import grains from "./grains";
import hops from "./hops";
import yeasts from "./yeasts";
import recipes from "./recipes";
import additives from "./additives";

const kbMigrations: Migration[] = [grains, hops, yeasts, recipes, additives];

export default kbMigrations;
