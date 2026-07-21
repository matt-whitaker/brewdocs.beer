import type {Migration} from "@brewdocs.beer/core";
import batch from "./batch";

const appMigrations: Migration[] = [batch];

export default appMigrations;
