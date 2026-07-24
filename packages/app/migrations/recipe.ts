import type {Migration} from "@brewdocs.beer/core";
import {defaultBrewable} from "../src/model/brewable";
import type Recipe from "../src/model/recipe";

// v0 is any recipe stored before the app started stamping `version` at all —
// assumed for any record with no `version` field. Stub: stamps the version
// only, matching the batch/kb v0->v1 convention.
const recipeV0ToV1: Migration<Recipe> = {
    namespace: "app.recipe",
    from: 0,
    to: 1,
    up: (data) => ({...data, version: 1})
};

// v1 is any recipe stored before `brewable` existed. Attaches a default
// brewable so the recipe-edit pilot has something to read/write; populating
// it from the legacy ingredient arrays is a separate follow-up (the deriver).
const recipeV1ToV2: Migration<Recipe> = {
    namespace: "app.recipe",
    from: 1,
    to: 2,
    up: (data) => ({...data, version: 2, brewable: data.brewable ?? defaultBrewable()})
};

const recipeMigrations: Migration<Recipe>[] = [recipeV0ToV1, recipeV1ToV2];

export default recipeMigrations;
