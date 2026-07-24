import type {Migration} from "@brewdocs.beer/core";
import batch from "./batch";
import recipe from "./recipe";

const appMigrations: Migration[] = [...batch, ...recipe];

export default appMigrations;
